import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  TokenStatic,
  TokenType,
  TokenVerification
} from '@injectivelabs/token-metadata'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import {
  readJSONFile,
  getTokenType,
  getDenomTrace,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { getInsuranceFundToken, getCw20BankMetadata } from './helper/getter'
import { BankMetadata, Token } from './types'

// refetch ibc denom trace
const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const mainnetStaticTokensMap = tokensToDenomMap([
  ...readJSONFile({ path: 'tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/externalTokens.json' })
])

const devnetIbcSupplyTokens = readJSONFile({
  path: 'tokens/bankSupplyTokens/devnet.json'
}).filter((token: Token) => token.tokenType === TokenType.Ibc) as Token[]
const testnetIbcSupplyTokens = readJSONFile({
  path: 'tokens/bankSupplyTokens/testnet.json'
}).filter((token: Token) => token.tokenType === TokenType.Ibc) as Token[]
const mainnetIbcSupplyTokens = readJSONFile({
  path: 'tokens/bankSupplyTokens/mainnet.json'
}).filter((token: Token) => token.tokenType === TokenType.Ibc) as Token[]

const devnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/staticTokens/devnet.json' })
)
const testnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/staticTokens/testnet.json' })
)
const devnetIbcSupplyTokensMap = tokensToDenomMap(devnetIbcSupplyTokens)
const testnetIbcSupplyTokensMap = tokensToDenomMap(testnetIbcSupplyTokens)
const mainnetIbcSupplyTokensMap = tokensToDenomMap(mainnetIbcSupplyTokens)

const formatFactoryToken = (bankMetadata: BankMetadata): TokenStatic => {
  return {
    coinGeckoId: '',
    name: bankMetadata.name,
    denom: bankMetadata.denom,
    address: bankMetadata.denom,
    decimals: bankMetadata.decimals || untaggedSymbolMeta.Unknown.decimals,
    symbol: bankMetadata.symbol || untaggedSymbolMeta.Unknown.symbol,
    logo: untaggedSymbolMeta.Unknown.logo,
    externalLogo: bankMetadata.logo || untaggedSymbolMeta.Unknown.logo,
    tokenType: TokenType.TokenFactory,
    tokenVerification: TokenVerification.Internal
  }
}

export const generateSupplyToken = async (network: Network) => {
  let supplyDenoms = readJSONFile({
    path: 'tokens/bankSupplyDenoms/devnet.json'
  })
  let existingStaticTokensMap = devnetStaticTokensMap
  let existingIbcTokensMap = devnetIbcSupplyTokensMap

  if (isTestnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'tokens/bankSupplyDenoms/testnet.json'
    })
    existingStaticTokensMap = testnetStaticTokensMap
    existingIbcTokensMap = testnetIbcSupplyTokensMap
  }

  if (isMainnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'tokens/bankSupplyDenoms/mainnet.json'
    })
    existingStaticTokensMap = mainnetStaticTokensMap
    existingIbcTokensMap = mainnetIbcSupplyTokensMap
  }

  const existingCW20TokensMap = readJSONFile({
    path: `tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
    fallback: {}
  })

  try {
    const filteredDenoms = supplyDenoms.filter(
      (denom: string) => !existingStaticTokensMap[denom.toLowerCase()]
    )

    const supplyTokens = []

    for (const denom of filteredDenoms) {
      // script optimization: use cached denomTrace data
      const existingIbcToken = existingIbcTokensMap[denom.toLowerCase()]

      if (!shouldFlush && existingIbcToken) {
        supplyTokens.push(existingIbcToken)

        continue
      }

      if (denom.startsWith('factory')) {
        const existingFactoryToken = getCw20BankMetadata(denom, network)

        if (existingFactoryToken) {
          supplyTokens.push(formatFactoryToken(existingFactoryToken))

          continue
        } else {
          supplyTokens.push({
            ...untaggedSymbolMeta.Unknown,
            denom,
            address: denom,
            isNative: false,
            tokenType: getTokenType(denom),
            tokenVerification: TokenVerification.Unverified
          })

          continue
        }
      }

      if (denom.startsWith('share')) {
        const insuranceToken = getInsuranceFundToken(
          denom,
          Network.MainnetSentry
        )

        if (insuranceToken) {
          supplyTokens.push(insuranceToken)
        }

        continue
      }

      if (denom.startsWith('peggy') || denom.startsWith('0x')) {
        const peggyToken = await fetchPeggyTokenMetaData(denom, network)

        if (peggyToken) {
          supplyTokens.push(peggyToken)

          continue
        }
      }

      if (denom.startsWith('ibc/')) {
        const { path, channelId, baseDenom } = await getDenomTrace(
          denom,
          network
        )

        supplyTokens.push({
          denom,
          path,
          channelId,
          baseDenom,
          address: denom,
          isNative: false,
          symbol: baseDenom,
          name: untaggedSymbolMeta.Unknown.name,
          logo: untaggedSymbolMeta.Unknown.logo,
          coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
          decimals: untaggedSymbolMeta.Unknown.decimals,
          tokenType: TokenType.Ibc,
          tokenVerification: TokenVerification.Unverified
        })

        continue
      }
    }

    const filteredTokens = [...supplyTokens].filter(({ denom }) => denom)

    await updateJSONFile(
      `tokens/bankSupplyTokens/${getNetworkFileName(network)}.json`,
      filteredTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ GenerateSupplyTokens ${network}`)
  } catch (e) {
    console.log('Error generating supply tokens')
  }
}

generateSupplyToken(Network.Devnet)
generateSupplyToken(Network.MainnetSentry)
generateSupplyToken(Network.TestnetSentry)
