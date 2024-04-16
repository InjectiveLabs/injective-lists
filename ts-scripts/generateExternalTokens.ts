import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { isCw20ContractAddress } from '@injectivelabs/token-metadata'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import {
  readJSONFile,
  getTokenType,
  getDenomTrace,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName,
  tokensToAddressMap
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import { fetchCw20ContractMetaData } from './fetchCw20Metadata'
import { getChainTokenMetadata, getInsuranceFundToken } from './helper/getter'
import { Token, ApiTokenMetadata } from './types'

/* Mainnet only */

const staticTokens = readJSONFile({ path: 'tokens/staticTokens/mainnet.json' })
const existingExternalTokens = readJSONFile({
  path: 'tokens/externalTokens.json'
})

// refetch ibc denom trace
const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const externalTokenMetadataApi = new HttpRestClient(
  'https://api.tfm.com/api/v1/ibc/chain/injective-1/',
  {
    timeout: 2000
  }
)

const externalIbcTokens = existingExternalTokens.filter(
  (token: Token) => token.tokenType === TokenType.Ibc
)

const staticTokensMap = tokensToDenomMap(staticTokens)
const existingIbcTokensMap = tokensToDenomMap(externalIbcTokens)
const staticTokensAddressMap = tokensToAddressMap(staticTokens)

const formatApiTokenMetadata = async (
  tokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  const filteredTokenMetadata = tokenMetadata.filter((metadata) => {
    const denom = metadata.contractAddr.toLowerCase()

    return !staticTokensMap[denom] && !staticTokensAddressMap[denom]
  })

  const externalTokens = [] as any

  const existingCW20TokensMap = readJSONFile({
    path: `tokens/cw20Tokens/${getNetworkFileName(Network.MainnetSentry)}.json`,
    fallback: {}
  })

  for (const tokenMetadata of filteredTokenMetadata) {
    const denom = tokenMetadata.contractAddr.toLowerCase()

    const bankMetadata = getChainTokenMetadata(denom, Network.MainnetSentry)

    if (!shouldFlush) {
      // script optimization: use cached denomTrace data
      const existingIbcToken = existingIbcTokensMap[denom.toLowerCase()]

      if (existingIbcToken) {
        externalTokens.push(existingIbcToken)

        continue
      }
    }

    if (denom.startsWith('share')) {
      const insuranceToken = getInsuranceFundToken(denom, Network.MainnetSentry)

      if (insuranceToken) {
        externalTokens.push(insuranceToken)
      }

      continue
    }

    if (denom.startsWith('peggy') || denom.startsWith('0x')) {
      const peggyToken = await fetchPeggyTokenMetaData(
        denom,
        Network.MainnetSentry
      )

      if (peggyToken) {
        externalTokens.push(peggyToken)

        continue
      }
    }

    if (isCw20ContractAddress(denom)) {
      const existingCW20Token = existingCW20TokensMap[denom.toLowerCase()]

      if (existingCW20Token && !shouldFlush) {
        externalTokens.push(existingCW20Token)

        continue
      }

      const cw20Token = await fetchCw20ContractMetaData(
        denom,
        Network.MainnetSentry
      )

      if (cw20Token) {
        externalTokens.push(cw20Token)

        continue
      } else {
        console.log(`cw20 contract ${denom} not found`)
      }
    }

    const meta = {
      denom,
      address: denom,
      symbol: tokenMetadata.symbol || untaggedSymbolMeta.Unknown.symbol,
      name: tokenMetadata.name || bankMetadata?.name,
      logo: tokenMetadata.imageUrl || bankMetadata?.logo,
      decimals: tokenMetadata.decimals || bankMetadata?.decimals,
      tokenType: getTokenType(denom),
      tokenVerification: TokenVerification.External
    }

    if (denom.startsWith('ibc/')) {
      const { path, channelId, baseDenom } = await getDenomTrace(
        denom,
        Network.MainnetSentry,
        tokenMetadata.symbol
      )

      externalTokens.push({
        ...meta,
        path,
        denom,
        baseDenom,
        channelId,
        tokenType: TokenType.Ibc,
        hash: denom.replace('ibc/', '')
      })

      continue
    }

    externalTokens.push(meta)
  }

  return externalTokens
}

const generateExternalTokens = async () => {
  try {
    const response = (await externalTokenMetadataApi.get('tokens')) as {
      data: ApiTokenMetadata[]
    }

    if (!response.data || !Array.isArray(response.data)) {
      return
    }

    const filteredData = response.data.filter(
      ({ contractAddr }) => !staticTokensMap[contractAddr.toLowerCase()]
    )
    const tokens = await formatApiTokenMetadata(filteredData)
    const filteredTokens = tokens.filter(
      ({ denom }) =>
        denom &&
        !staticTokensMap[denom.toLowerCase()] &&
        !staticTokensAddressMap[denom.toLowerCase()]
    )

    await updateJSONFile(
      'tokens/externalTokens.json',
      filteredTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log('✅✅✅ GenerateExternalTokens')
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
