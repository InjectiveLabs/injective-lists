import { writeFile } from 'node:fs'
import { Network } from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { fetchPeggyTokenMetaData } from './fetchPeggyMetadata'
import * as staticTokens from '../tokens/staticTokens/mainnet.json'
import * as existingExternalTokens from '../tokens/externalTokens.json'
import {
  getTokenType,
  getDenomTrace,
  getSymbolMeta,
  tokensToDenomMap,
  cw20TokensToDenomMap
} from './helper/utils'
import {
  getCw20TokenMetadata,
  getChainTokenMetadata,
  getInsuranceFundToken
} from './helper/getter'
import { ApiTokenMetadata } from './types'

/* Mainnet only */

// refetch ibc denom trace
const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const externalTokenMetadataApi = new HttpRestClient(
  'https://api.tfm.com/api/v1/ibc/chain/injective-1/',
  {
    timeout: 2000
  }
)

const externalIbcTokens = existingExternalTokens.filter(
  ({ tokenType }) => tokenType === TokenType.Ibc
)

const staticTokensMap = tokensToDenomMap(staticTokens)
const existingIbcTokensMap = tokensToDenomMap(externalIbcTokens)
const staticTokensAddressMap = cw20TokensToDenomMap(staticTokens)

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

    const cw20Metadata = getCw20TokenMetadata(denom, Network.MainnetSentry)

    if (cw20Metadata) {
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
    const tokens = await formatApiTokenMetadata(filteredData)
    const filteredTokens = tokens.filter(
      ({ denom }) =>
        denom &&
        !staticTokensMap[denom.toLowerCase()] &&
        !staticTokensAddressMap[denom.toLowerCase()]
    )

    const data = JSON.stringify(
      filteredTokens.sort((a, b) => a.denom.localeCompare(b.denom)),
      null,
      2
    )

    writeFile('./../tokens/externalTokens.json', data, (err) => {
      if (err) {
        console.error('Error writing external tokens:', err)
      } else {
        console.log('✅✅✅ GenerateExternalTokens')
      }
    })
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
