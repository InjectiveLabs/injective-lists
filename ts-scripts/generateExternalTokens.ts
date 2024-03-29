import { writeFileSync } from 'node:fs'
import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import * as staticTokens from '../tokens/staticTokens/mainnet.json'
import * as existingExternalTokens from '../tokens/externalTokens.json'
import {
  getTokenType,
  getDenomTrace,
  getSymbolMeta,
  tokensToDenomMap,
  cw20TokensToDenomMap
} from './helper/utils'
import { getCw20TokenMetadata, getChainTokenMetadata } from './helper/getter'
import { ApiTokenMetadata } from './types'

/* Mainnet only */

const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const externalTokenMetadataApi = new HttpRestClient(
  'https://api.tfm.com/api/v1/ibc/chain/injective-1/',
  {
    timeout: 2000
  }
)

const staticTokensMap = tokensToDenomMap(staticTokens)
const staticTokensAddressMap = cw20TokensToDenomMap(staticTokens)
const existingExternalTokensMap = tokensToDenomMap(existingExternalTokens)
const existingCw20ExternalTokensMap = cw20TokensToDenomMap(
  existingExternalTokens
)

const formatApiTokenMetadata = async (
  tokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  const filteredTokenMetadata = tokenMetadata.filter((metadata) => {
    const denom = metadata.contractAddr.toLowerCase()

    return (
      shouldFlush ||
      (!existingExternalTokensMap[denom] &&
        !existingCw20ExternalTokensMap[denom] &&
        !staticTokensMap[denom] &&
        !staticTokensAddressMap[denom])
    )
  })

  const externalTokens = [] as any

  for (const tokenMetadata of filteredTokenMetadata) {
    const denom = tokenMetadata.contractAddr.toLowerCase()

    const bankMetadata = getChainTokenMetadata(denom, Network.MainnetSentry)
    const cw20Metadata = getCw20TokenMetadata(denom, Network.MainnetSentry)

    if (cw20Metadata) {
      console.log(`✅ cw20Metadata for ${denom} found!`, {
        ...cw20Metadata,
        name: tokenMetadata.name || cw20Metadata.name,
        logo: tokenMetadata.imageUrl || cw20Metadata.logo
      })
      externalTokens.push({
        ...cw20Metadata,
        name: tokenMetadata.name || cw20Metadata.name,
        logo: tokenMetadata.imageUrl || cw20Metadata.logo
      })

      continue
    }

    const meta = {
      denom,
      ...getSymbolMeta({
        symbol: tokenMetadata.symbol,
        name: tokenMetadata.name || bankMetadata?.name,
        logo: tokenMetadata.imageUrl || bankMetadata?.logo,
        decimals: tokenMetadata.decimals || bankMetadata?.decimals
      }),
      tokenType: getTokenType(denom),
      tokenVerification: TokenVerification.External
    }

    if (denom.startsWith('ibc/')) {
      const { path, channelId, baseDenom } = await getDenomTrace(
        denom,
        Network.MainnetSentry,
        tokenMetadata.symbol
      )

      console.log(
        `✅ Uploaded ${Network.MainnetSentry} ibc token denom trace for ${denom}`
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
    const newExternalTokens = await formatApiTokenMetadata(filteredData)

    const tokens = shouldFlush
      ? newExternalTokens
      : [...existingExternalTokens, ...newExternalTokens]

    const filteredTokens = tokens.filter(
      ({ denom }) =>
        denom &&
        !staticTokensMap[denom.toLowerCase()] &&
        !staticTokensAddressMap[denom.toLowerCase()]
    )

    writeFileSync(
      './../tokens/externalTokens.json',
      JSON.stringify(
        filteredTokens.sort((a, b) => a.denom.localeCompare(b.denom)),
        null,
        2
      )
    )

    console.log('✅✅✅ GenerateExternalTokens')
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
