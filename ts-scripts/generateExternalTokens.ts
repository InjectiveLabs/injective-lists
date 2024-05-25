import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { isCw20ContractAddress } from '@injectivelabs/token-metadata'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  tokenToAddressMap,
  tokensToDenomMapKeepCasing
} from './helper/utils'
import { fetchIbcTokenMetaData } from './fetchIbcDenomTrace'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import { fetchCw20Token, fetchCw20FactoryToken } from './fetchCw20Metadata'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { ApiTokenMetadata } from './types'

/* Mainnet only */

const staticTokens = readJSONFile({ path: 'tokens/staticTokens/mainnet.json' })
const staticTokensMap = tokensToDenomMap(staticTokens)
const staticTokensAddressMap = tokenToAddressMap(staticTokens)

const cw20Tokens = readJSONFile({ path: 'tokens/cw20Tokens/mainnet.json' })
const cw20TokensMap = tokensToDenomMap(cw20Tokens)
const cw20TokensAddressMap = tokenToAddressMap(cw20Tokens)

const factoryTokens = readJSONFile({
  path: 'tokens/factoryTokens/mainnet.json'
})
const factoryTokensMap = tokensToDenomMapKeepCasing(factoryTokens)

const formatApiTokenMetadata = async (
  externalTokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  const filteredExternalTokenMetadata = externalTokenMetadata.filter(
    (metadata) => {
      const denom = metadata.contractAddr.toLowerCase()

      const isPartOfStaticTokenList =
        staticTokensMap[denom] || staticTokensAddressMap[denom]

      const isPartOfCw20TokenList =
        cw20TokensMap[denom] || cw20TokensAddressMap[denom]

      return (
        !isPartOfStaticTokenList &&
        !isPartOfCw20TokenList &&
        !factoryTokensMap[metadata.contractAddr]
      )
    }
  )

  const externalTokens = [] as any

  for (const externalTokenMetadata of filteredExternalTokenMetadata) {
    const denom = externalTokenMetadata.contractAddr

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
      const cw20Token = await fetchCw20Token(denom, Network.MainnetSentry)

      if (cw20Token) {
        externalTokens.push(cw20Token)

        const cw20FactoryToken = await fetchCw20FactoryToken(
          denom,
          Network.MainnetSentry
        )

        externalTokens.push(cw20FactoryToken)

        continue
      }
    }

    if (denom.startsWith('factory')) {
      const subDenom = [...denom.split('/')].pop() as string

      if (isCw20ContractAddress(subDenom)) {
        console.log('subDenom isCw20ContractAddress', denom)

        continue
      }

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
        tokenVerification: TokenVerification.Internal
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
  const path = 'data/externalTokensSource.json'

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

    const filteredData = externalTokensSource.filter(
      ({ contractAddr }) => !staticTokensMap[contractAddr.toLowerCase()]
    )
    const tokens = await formatApiTokenMetadata(filteredData)

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

    await updateJSONFile(
      'tokens/externalTokens.json',
      uniqueTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log('✅✅✅ GenerateExternalTokens')
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
