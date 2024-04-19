import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { isCw20ContractAddress } from '@injectivelabs/token-metadata'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import {
  readJSONFile,
  getDenomTrace,
  updateJSONFile,
  tokensToDenomMap,
  tokenToAddressMap,
  tokensToAddressMap
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import { fetchCw20ContractMetaData } from './fetchCw20Metadata'
import { getInsuranceFundToken } from './helper/getter'
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
const cw20Tokens = existingExternalTokens.filter((token: Token) =>
  [TokenType.Cw20, TokenType.TokenFactory].includes(
    token.tokenType as TokenType
  )
)

const staticTokensMap = tokensToDenomMap(staticTokens)
const existingIbcTokensMap = tokensToDenomMap(externalIbcTokens)
const staticTokensAddressMap = tokenToAddressMap(staticTokens)
const existingCw20TokensMap = tokensToAddressMap(cw20Tokens)

const formatApiTokenMetadata = async (
  tokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  const filteredTokenMetadata = tokenMetadata.filter((metadata) => {
    const denom = metadata.contractAddr.toLowerCase()

    return !staticTokensMap[denom] && !staticTokensAddressMap[denom]
  })

  const externalTokens = [] as any

  for (const tokenMetadata of filteredTokenMetadata) {
    const denom = tokenMetadata.contractAddr.toLowerCase()

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
      const existingCw20Tokens = existingCw20TokensMap[denom.toLowerCase()]

      if (!shouldFlush && existingCw20Tokens) {
        externalTokens.push(...existingCw20Tokens)

        continue
      }

      const cw20Tokens = await fetchCw20ContractMetaData(
        denom,
        Network.MainnetSentry
      )

      if (cw20Tokens && cw20Tokens.length > 0) {
        externalTokens.push(...cw20Tokens)

        continue
      }
    }

    if (denom.startsWith('ibc/')) {
      const denomTrace = await getDenomTrace(denom, Network.MainnetSentry)

      externalTokens.push({
        address: denom,
        symbol: tokenMetadata.symbol || untaggedSymbolMeta.Unknown.symbol,
        name: tokenMetadata.name,
        logo: tokenMetadata.imageUrl,
        decimals: tokenMetadata.decimals,
        tokenVerification: denomTrace
          ? TokenVerification.External
          : TokenVerification.Unverified,
        denom,
        path: denomTrace?.path || '',
        baseDenom: denomTrace?.baseDenom || tokenMetadata.symbol,
        channelId: denomTrace?.channelId || '',
        tokenType: TokenType.Ibc,
        hash: denom.replace('ibc/', '')
      })

      continue
    }
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
