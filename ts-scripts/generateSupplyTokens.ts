import {
  TokenType,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/token-metadata'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName
} from './helper/utils'
import {
  getInsuranceFundToken,
  getBankTokenFactoryMetadata
} from './helper/getter'
import { symbolMeta } from './data/symbolMeta'
import { fetchCw20FactoryToken } from './fetchCw20Metadata'
import { fetchIbcTokenMetaData } from './fetchIbcDenomTrace'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'

const mainnetStaticTokensMap = tokensToDenomMap([
  ...readJSONFile({ path: 'tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/externalTokens.json' })
])

const devnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/staticTokens/devnet.json' })
)
const testnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/staticTokens/testnet.json' })
)

export const generateSupplyToken = async (network: Network) => {
  let supplyDenoms = readJSONFile({
    path: 'data/bankSupplyDenoms/devnet.json'
  })
  let existingStaticTokensMap = devnetStaticTokensMap

  if (isTestnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'data/bankSupplyDenoms/testnet.json'
    })
    existingStaticTokensMap = testnetStaticTokensMap
  }

  if (isMainnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'data/bankSupplyDenoms/mainnet.json'
    })
    existingStaticTokensMap = mainnetStaticTokensMap
  }

  try {
    const filteredDenoms = supplyDenoms.filter(
      (denom: string) => !existingStaticTokensMap[denom.toLowerCase()]
    )

    const supplyTokens = []

    for (const denom of filteredDenoms) {
      if (denom.startsWith('factory')) {
        const subDenom = [...denom.split('/')].pop() as string

        if (isCw20ContractAddress(subDenom)) {
          const cw20Token = await fetchCw20FactoryToken(subDenom, network)

          if (cw20Token) {
            supplyTokens.push(cw20Token)

            continue
          }
        } else {
          // token factory
          const bankMetadata = getBankTokenFactoryMetadata(denom, network)

          supplyTokens.push({
            ...untaggedSymbolMeta.Unknown,
            ...(bankMetadata?.denom && {
              denom: bankMetadata.denom,
              address: bankMetadata.denom
            }),
            ...(bankMetadata?.name && { name: bankMetadata.name }),
            ...(bankMetadata?.symbol && { symbol: bankMetadata.symbol }),
            ...(bankMetadata?.logo && { externalLogo: bankMetadata.logo }),
            ...(bankMetadata?.decimals && { decimals: bankMetadata.decimals }),
            tokenType: TokenType.TokenFactory,
            tokenVerification: TokenVerification.Internal
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
        } else {
          supplyTokens.push({
            denom,
            name: denom,
            decimals: 18,
            symbol: denom,
            address: denom,
            logo: symbolMeta.INJ.logo,
            externalLogo: symbolMeta.INJ.logo,
            tokenType: TokenType.InsuranceFund,
            tokenVerification: TokenVerification.Unverified,
            coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId
          })
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
        const ibcToken = await fetchIbcTokenMetaData(denom, network)

        if (ibcToken) {
          supplyTokens.push(ibcToken)

          continue
        }
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
