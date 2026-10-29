import { EvmChainId } from '@injectivelabs/ts-types'
import {
  Network,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainGrpcErc20Api, TokenType } from '@injectivelabs/sdk-ts'
import { pathToFileURL } from 'node:url'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName,
  bankMetadataToAddressMap
} from '../helper/utils'
import type { Token, EvmToken } from '../../types'
import { getCuratedBankDenoms } from '../helper/staticTokenSources'
import { devnetHardcodedCw20Denoms } from '../../data/tokens/cw20'

const devnetBankMetadataAddressMap = bankMetadataToAddressMap([
  ...readJSONFile({ path: 'src/cache/bankMetadata/devnet.json' })
])

const testnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'src/cache/bankMetadata/testnet.json' })
)
const mainnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'src/cache/bankMetadata/mainnet.json' })
)

const devnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/devnet.json'
  })
)
const testnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/testnet.json'
  })
)
const mainnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/mainnet.json'
  })
)

function getEvmChainId(network: Network) {
  if (isMainnet(network)) {
    return EvmChainId.MainnetEvm
  }

  if (isTestnet(network)) {
    return EvmChainId.TestnetEvm
  }

  return EvmChainId.DevnetEvm
}

function formatToEvmToken({
  token,
  network,
  evmAddress
}: {
  token: Token
  network: Network
  evmAddress: string
}): EvmToken {
  return {
    name: token.name,
    address: evmAddress,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId: getEvmChainId(network),
    logoUri: token.logo
  }
}

export async function generateEvmTokensFromMTSPairs(network: Network) {
  const endpoints = getNetworkEndpoints(network)
  const erc20Api = new ChainGrpcErc20Api(endpoints.grpc)

  let tokenMap = devnetTokensMap
  let bankMetadataAddressMap = devnetBankMetadataAddressMap

  if (isTestnet(network)) {
    tokenMap = testnetTokensMap
    bankMetadataAddressMap = testnetBankMetadataAddressMap
  }

  if (isMainnet(network)) {
    tokenMap = mainnetTokensMap
    bankMetadataAddressMap = mainnetBankMetadataAddressMap
  }

  try {
    let tokenPairs: { bankDenom: string; erc20Address: string }[]

    if (isMainnet(network)) {
      tokenPairs = (await erc20Api.fetchAllTokenPairsWithPagination()).tokenPairs
    } else {
      const path = `src/cache/evmTokenPairs/${getNetworkFileName(network)}.json`
      const cw20Denoms = readJSONFile({
        path: `src/cache/cw20Denoms/${getNetworkFileName(network)}.json`
      })
      const curatedDenoms = new Set(
        getCuratedBankDenoms(network, [
          ...cw20Denoms,
          ...(network === Network.Devnet ? devnetHardcodedCw20Denoms : [])
        ]).map(denom => denom.toLowerCase())
      )
      const cached = new Map<string, { bankDenom: string; erc20Address: string }>(
        readJSONFile({ path }).map((pair: any) => [pair.bankDenom, pair])
      )
      tokenPairs = []

      const tokens = Object.values(tokenMap).filter(token =>
        token.tokenType !== TokenType.Symbol &&
        curatedDenoms.has(token.denom.toLowerCase())
      )
      for (let i = 0; i < tokens.length; i += 10) {
        await Promise.all(tokens.slice(i, i + 10).map(async (token) => {
          try {
            const pair = await erc20Api.fetchTokenPairByDenom(token.denom)
            if (pair?.bankDenom === token.denom) {
              tokenPairs.push({
                bankDenom: pair.bankDenom,
                erc20Address: pair.erc20Address
              })
            }
          } catch {
            const previous = cached.get(token.denom)
            if (previous) tokenPairs.push(previous)
          }
        }))
      }

      updateJSONFile(
        path,
        tokenPairs.sort((a, b) => a.bankDenom.localeCompare(b.bankDenom))
      )
    }

    const evmTokenList: EvmToken[] = [
      {
        address: 'inj',
        decimals: 18,
        symbol: 'INJ',
        name: 'Injective',
        chainId: getEvmChainId(network),
        logoUri:
          'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/7123d071-0def-459a-16b9-d85e8ea04700/public'
      }
    ]

    for (const tokenPair of tokenPairs) {
      const tokenMetadata = tokenMap[tokenPair.bankDenom.toLowerCase()]

      if (!tokenMetadata) {
        console.log(`Token ${tokenPair.bankDenom} not found`)

        continue
      }

      const bankMetadata = bankMetadataAddressMap[tokenPair.bankDenom]?.[0]

      const evmTokenMetadata = formatToEvmToken({
        network,
        token: {
          ...tokenMetadata,
          ...(bankMetadata?.name && { name: bankMetadata.name }),
          ...(bankMetadata?.symbol && { symbol: bankMetadata.symbol }),
          decimals: isMainnet(network)
            ? bankMetadata?.decimals || tokenMetadata.decimals
            : bankMetadata?.decimals ?? tokenMetadata.decimals
        },
        evmAddress: tokenPair.erc20Address
      })

      evmTokenList.push(evmTokenMetadata)
    }

    updateJSONFile(
      `json/tokens/evm/${getNetworkFileName(network)}.json`,
      evmTokenList.sort((a, b) => a.address.localeCompare(b.address))
    )

    console.log(`EVM tokens for ${network} generated successfully!`)
  } catch (error) {
    console.log('Error fetching MTS pairs:', error)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateEvmTokensFromMTSPairs(Network.Devnet)
  generateEvmTokensFromMTSPairs(Network.TestnetSentry)
  generateEvmTokensFromMTSPairs(Network.MainnetSentry)
}
