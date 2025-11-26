import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName
} from '../../helper/utils'
import { symbolMeta } from '../../../data/tokens/symbolMeta'
import { getInsuranceFundToken } from '../../helper/getter'
import { fetchIbcTokenMetaData } from '../../helper/fetchIbcDenomTrace'
import { fetchPeggyTokenMetaData } from '../../helper/fetchPeggyTokens'
import { untaggedSymbolMeta } from '../../../data/tokens/untaggedSymbolMeta'

const mainnetStaticTokensMap = tokensToDenomMap([
  ...readJSONFile({ path: 'src/generated/tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/externalTokens.json' })
])

const devnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'src/generated/tokens/staticTokens/devnet.json' })
)
const testnetStaticTokensMap = tokensToDenomMap(
  readJSONFile({ path: 'src/generated/tokens/staticTokens/testnet.json' })
)

export const generateSupplyToken = async (network: Network) => {
  let supplyDenoms = readJSONFile({
    path: 'src/cache/bankSupplyDenoms/devnet.json'
  })
  let existingStaticTokensMap = devnetStaticTokensMap

  if (isTestnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'src/cache/bankSupplyDenoms/testnet.json'
    })
    existingStaticTokensMap = testnetStaticTokensMap
  }

  if (isMainnet(network)) {
    supplyDenoms = readJSONFile({
      path: 'src/cache/bankSupplyDenoms/mainnet.json'
    })
    existingStaticTokensMap = mainnetStaticTokensMap
  }

  try {
    const filteredDenoms = supplyDenoms.filter(
      (denom: string) => !existingStaticTokensMap[denom.toLowerCase()]
    )

    const supplyTokens = []

    for (const denom of filteredDenoms) {
      /*
        all factory denoms on chain are handled in
        the generateFactoryTokens script
      */
      if (denom.startsWith('factory')) {
        continue
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

        if (!peggyToken) {
          supplyTokens.push({
            denom,
            name: denom,
            decimals: 18,
            symbol: denom,
            address: denom.replace('peggy', ''),
            logo: untaggedSymbolMeta.Unknown.logo,
            externalLogo: untaggedSymbolMeta.Unknown.logo,
            tokenType: TokenType.Erc20,
            tokenVerification: TokenVerification.Unverified,
            coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId
          })

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

    if (filteredTokens.length === 0) {
      return
    }

    await updateJSONFile(
      `src/generated/tokens/bankSupplyTokens/${getNetworkFileName(
        network
      )}.json`,
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
