import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { isCw20ContractAddress } from '@injectivelabs/token-metadata'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  tokenToAddressMap
} from './helper/utils'
import {
  getInsuranceFundToken,
  getBankTokenFactoryMetadata
} from './helper/getter'
import { fetchIbcTokenMetaData } from './fetchIbcDenomTrace'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import { fetchCw20Token, fetchCw20FactoryToken } from './fetchCw20Metadata'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { ApiTokenMetadata } from './types'

/* Mainnet only */

const staticTokens = readJSONFile({ path: 'tokens/staticTokens/mainnet.json' })
const staticTokensMap = tokensToDenomMap(staticTokens)
const staticTokensAddressMap = tokenToAddressMap(staticTokens)

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
        console.log('subDenom caught', denom)

        continue
      }

      const bankMetadata = getBankTokenFactoryMetadata(
        denom,
        Network.MainnetSentry
      )

      externalTokens.push({
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

    if (denom.startsWith('ibc/')) {
      const ibcToken = await fetchIbcTokenMetaData(denom, Network.MainnetSentry)

      if (ibcToken) {
        externalTokens.push({
          ...ibcToken,
          ...(tokenMetadata.imageUrl && {
            externalLogo: tokenMetadata.imageUrl
          }),
          ...(tokenMetadata.name && { name: tokenMetadata.name }),
          ...(tokenMetadata.symbol && { symbol: tokenMetadata.symbol }),
          ...(tokenMetadata.decimals && { decimals: tokenMetadata.imageUrl })
        })

        continue
      }

      continue
    }
  }

  return externalTokens
}

const getExternalTokens = async () => {
  const path = 'tokens/externalTokensSource.json'

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
