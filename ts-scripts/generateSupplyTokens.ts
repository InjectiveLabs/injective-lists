import { writeFileSync } from 'node:fs'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import * as externalTokens from '../tokens/externalTokens.json'
import * as devnetStaticTokens from '../tokens/staticTokens/devnet.json'
import * as mainnetStaticTokens from '../tokens/staticTokens/mainnet.json'
import * as testnetStaticTokens from '../tokens/staticTokens/testnet.json'
import * as devnetBankSupplyDenoms from '../tokens/bankSupplyDenoms/devnet.json'
import * as mainnetBankSupplyDenoms from '../tokens/bankSupplyDenoms/mainnet.json'
import * as testnetBankSupplyDenoms from '../tokens/bankSupplyDenoms/testnet.json'
import * as devnetBankSupplyTokens from '../tokens/bankSupplyTokens/devnet.json'
import * as mainnetBankSupplyTokens from '../tokens/bankSupplyTokens/mainnet.json'
import * as testnetBankSupplyTokens from '../tokens/bankSupplyTokens/testnet.json'
import { getCw20TokenMetadata, getChainTokenMetadata } from './helper/getter'
import {
  getTokenType,
  getDenomTrace,
  getSymbolMeta,
  tokensToDenomMap,
  getNetworkFileName
} from './helper/utils'

// refetch ibc denom trace
const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const mainnetStaticTokensMap = tokensToDenomMap([
  ...mainnetStaticTokens,
  ...externalTokens
])

const devnetIbcSupplyTokens = devnetBankSupplyTokens.filter(
  ({ tokenType }) => tokenType === TokenType.Ibc
)
const testnetIbcSupplyTokens = testnetBankSupplyTokens.filter(
  ({ tokenType }) => tokenType === TokenType.Ibc
)
const mainnetIbcSupplyTokens = mainnetBankSupplyTokens.filter(
  ({ tokenType }) => tokenType === TokenType.Ibc
)

const devnetStaticTokensMap = tokensToDenomMap(devnetStaticTokens)
const testnetStaticTokensMap = tokensToDenomMap(testnetStaticTokens)
const devnetIbcSupplyTokensMap = tokensToDenomMap(devnetIbcSupplyTokens)
const testnetIbcSupplyTokensMap = tokensToDenomMap(testnetIbcSupplyTokens)
const mainnetIbcSupplyTokensMap = tokensToDenomMap(mainnetIbcSupplyTokens)

export const generateSupplyToken = async (network: Network) => {
  let supplyDenoms = devnetBankSupplyDenoms
  let existingStaticTokensMap = devnetStaticTokensMap
  let existingIbcTokensMap = devnetIbcSupplyTokensMap

  if (isTestnet(network)) {
    supplyDenoms = testnetBankSupplyDenoms
    existingStaticTokensMap = testnetStaticTokensMap
    existingIbcTokensMap = testnetIbcSupplyTokensMap
  }

  if (isMainnet(network)) {
    supplyDenoms = mainnetBankSupplyDenoms
    existingStaticTokensMap = mainnetStaticTokensMap
    existingIbcTokensMap = mainnetIbcSupplyTokensMap
  }

  try {
    const filteredDenoms = supplyDenoms.filter(
      (denom) => !existingStaticTokensMap[denom.toLowerCase()]
    )

    const supplyTokens = []

    for (const denom of filteredDenoms) {
      // script optimization: use cached denomTrace data
      const existingIbcToken = existingIbcTokensMap[denom.toLowerCase()]

      if (!shouldFlush && existingIbcToken) {
        supplyTokens.push(existingIbcToken)

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

        console.log(
          ` ✅ Uploaded ${network} ibc token denom trace for ${denom}`
        )

        supplyTokens.push({
          denom,
          path,
          channelId,
          baseDenom,
          isNative: false,
          ...getSymbolMeta({
            name: denom,
            symbol: 'Unknown'
          }),
          tokenType: TokenType.Ibc,
          tokenVerification: TokenVerification.Unverified
        })

        continue
      }

      const cw20Metadata = getCw20TokenMetadata(denom, network)

      if (cw20Metadata) {
        console.log(`✅ cw20Metadata for ${denom} found!`)
        supplyTokens.push(cw20Metadata)

        continue
      }

      const bankMetadata = getChainTokenMetadata(denom, network)

      supplyTokens.push({
        denom: denom,
        isNative: false,
        ...getSymbolMeta({
          name: bankMetadata?.name,
          decimals: bankMetadata?.decimals,
          logo: bankMetadata?.logo,
          symbol: bankMetadata?.symbol || 'Unknown'
        }),
        tokenType: getTokenType(denom),
        tokenVerification: TokenVerification.Unverified
      })
    }

    const filteredTokens = [...supplyTokens].filter(({ denom }) => denom)

    writeFileSync(
      `./../tokens/bankSupplyTokens/${getNetworkFileName(network)}.json`,
      JSON.stringify(
        filteredTokens.sort((a, b) => a.denom.localeCompare(b.denom)),
        null,
        2
      )
    )

    console.log(`✅✅✅ GenerateSupplyTokens ${network}`)
  } catch (e) {}
}

generateSupplyToken(Network.Devnet)
generateSupplyToken(Network.MainnetSentry)
generateSupplyToken(Network.TestnetSentry)
