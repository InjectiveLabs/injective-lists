import {
  TokenType,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  tokenToAddressMap
} from '../../helper/utils'
import {
  fetchCw20Token,
  fetchCw20FactoryToken
} from '../../helper/fetchCw20Metadata'
import { getCw20Denom, getSupplyDenom } from '../../helper/getter'
import { fetchIbcTokenMetaData } from '../../helper/fetchIbcDenomTrace'
import { fetchPeggyTokenMetaData } from '../../helper/fetchPeggyTokens'
import { untaggedSymbolMeta } from '../../../data/tokens/untaggedSymbolMeta'
import { ApiTokenMetadata } from '../../../types'

/* Mainnet only */

const staticTokens = readJSONFile({
  path: 'src/generated/tokens/staticTokens/mainnet.json'
})
const staticTokensMap = tokensToDenomMap(staticTokens)
const staticTokensAddressMap = tokenToAddressMap(staticTokens)

const formatApiTokenMetadata = async (
  externalTokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  const filteredExternalTokenMetadata = externalTokenMetadata.filter(
    (metadata) => {
      const denom = metadata.contractAddr.toLowerCase()

      const isPartOfStaticTokenList =
        staticTokensMap[denom] || staticTokensAddressMap[denom]

      return !isPartOfStaticTokenList
    }
  )

  const externalTokens = [] as any

  for (const externalTokenMetadata of filteredExternalTokenMetadata) {
    let denom = externalTokenMetadata.contractAddr
    const supplyDenom = getSupplyDenom(denom, Network.MainnetSentry)

    if (supplyDenom) {
      denom = supplyDenom
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
      const factoryCw20Denom = getCw20Denom(denom, Network.MainnetSentry)
      const cw20Token = await fetchCw20Token(denom, Network.MainnetSentry)

      if (cw20Token) {
        externalTokens.push(cw20Token)

        const cw20FactoryToken = await fetchCw20FactoryToken(
          factoryCw20Denom || denom,
          Network.MainnetSentry
        )

        externalTokens.push(cw20FactoryToken)

        continue
      }
    }

    if (denom.startsWith('factory')) {
      externalTokens.push({
        ...untaggedSymbolMeta.Unknown,
        denom,
        address: denom,
        name: externalTokenMetadata.name,
        symbol: externalTokenMetadata.symbol,
        decimals: externalTokenMetadata.decimals,
        ...(externalTokenMetadata?.imageUrl && {
          externalLogo: externalTokenMetadata.imageUrl
        }),
        tokenType: TokenType.TokenFactory,
        tokenVerification: TokenVerification.Unverified
      })

      continue
    }

    if (denom.startsWith('ibc/')) {
      const ibcToken = await fetchIbcTokenMetaData(denom, Network.MainnetSentry)

      if (ibcToken) {
        externalTokens.push({
          ...ibcToken,
          denom,
          address: denom,
          hash: denom.replace('ibc/', ''),
          ...(externalTokenMetadata.imageUrl && {
            externalLogo: externalTokenMetadata.imageUrl
          }),
          ...(externalTokenMetadata.name && {
            name: externalTokenMetadata.name
          }),
          ...(externalTokenMetadata.symbol && {
            symbol: externalTokenMetadata.symbol
          }),
          ...(externalTokenMetadata.decimals && {
            decimals: externalTokenMetadata.decimals
          })
        })
      }

      continue
    }
  }

  return externalTokens
}

const getExternalTokens = async () => {
  const path = 'src/cache/externalTokensSource.json'

  try {
    const externalTokenMetadataApi = new HttpRestClient(
      'https://api.tfm.com/api/v1/ibc/chain/injective-1/',
      {
        timeout: 2000
      }
    )

    const response = (await externalTokenMetadataApi.get('tokens')) as {
      data: ApiTokenMetadata[]
    }

    if (!response.data || !Array.isArray(response.data)) {
      return
    }

    await updateJSONFile(path, response.data)

    return response.data
  } catch (e) {
    console.log(
      'Error fetching external tokens from api.tfm.com, using cache data'
    )
    console.log(e)

    return readJSONFile({ path })
  }
}

const generateExternalTokens = async () => {
  try {
    const externalTokensSource =
      (await getExternalTokens()) as ApiTokenMetadata[]

    const tokens = await formatApiTokenMetadata(externalTokensSource)

    const filteredTokens = tokens.filter(
      (token) =>
        token &&
        token.denom &&
        !staticTokensMap[token.denom.toLowerCase()] &&
        !staticTokensAddressMap[token.denom.toLowerCase()]
    )

    const uniqueTokens = [
      ...new Map(filteredTokens.map((token) => [token.denom, token])).values()
    ]

    if (uniqueTokens.length === 0) {
      return
    }

    await updateJSONFile(
      'src/generated/tokens/externalTokens.json',
      uniqueTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log('✅✅✅ GenerateExternalTokens')
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
