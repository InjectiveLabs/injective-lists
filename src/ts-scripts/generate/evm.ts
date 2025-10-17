import { EvmChainId } from '@injectivelabs/ts-types'
import {
  Network,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainGrpcErc20Api } from '@injectivelabs/sdk-ts'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName
} from '../helper/utils'
import type { Token, EvmToken } from '../../types'

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

async function generateEvmTokensFromMTSPairs(network: Network) {
  const endpoints = getNetworkEndpoints(network)
  const erc20Api = new ChainGrpcErc20Api(endpoints.grpc)

  let tokenMap = devnetTokensMap

  if (isTestnet(network)) {
    tokenMap = testnetTokensMap
  }

  if (isMainnet(network)) {
    tokenMap = mainnetTokensMap
  }

  try {
    const response = await erc20Api.fetchAllTokenPairsWithPagination()

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

    for (const tokenPair of response.tokenPairs) {
      const tokenMetadata = tokenMap[tokenPair.bankDenom.toLowerCase()]

      if (!tokenMetadata) {
        console.log(`Token ${tokenPair.bankDenom} not found`)

        continue
      }

      const evmTokenMetadata = formatToEvmToken({
        network,
        token: tokenMetadata,
        evmAddress: tokenPair.erc20Address
      })

      evmTokenList.push(evmTokenMetadata)
    }

    await updateJSONFile(
      `json/tokens/evm/${getNetworkFileName(network)}.json`,
      evmTokenList.sort((a, b) => a.address.localeCompare(b.address))
    )

    console.log(`EVM tokens for ${network} generated successfully!`)
  } catch (error) {
    console.log('Error fetching MTS pairs:', error)
  }
}

generateEvmTokensFromMTSPairs(Network.Devnet)
generateEvmTokensFromMTSPairs(Network.TestnetSentry)
generateEvmTokensFromMTSPairs(Network.MainnetSentry)
