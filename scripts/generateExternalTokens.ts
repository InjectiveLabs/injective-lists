import { writeFileSync } from 'node:fs'
import { HttpRestClient } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import * as existingTokens from '../tokens.json'
import * as existingExternalTokens from '../externalTokens.json'
import { fetchSupplyDenoms } from './fetchBankSupplyDenoms'
import { getMetadata, fetchMetadata } from './fetchBankMetadata'
import { getTokenType, getDenomTrace, getSymbolMeta } from './helper/utils'
import { ApiTokenMetadata } from '../tokens/type'

const shouldFlush = process.argv.slice(2).some((arg) => arg === '--clean')

const externalTokenMetadataApi = new HttpRestClient(
  'https://api.tfm.com/api/v1/',
  {
    timeout: 2000
  }
)

const formatApiTokenMetadata = async (
  tokenMetadata: ApiTokenMetadata[]
): Promise<any[]> => {
  return Promise.all(
    tokenMetadata.map(async (metadata) => {
      const denom = metadata.contractAddr

      if (
        !shouldFlush &&
        existingExternalTokens.find(
          (token: { denom: string }) => token.denom === denom
        )
      ) {
        return
      }

      const bankMetadata = getMetadata(denom)

      const meta = {
        isNative: false,
        ...(getSymbolMeta({
          denom,
          symbol: metadata.symbol
        }) || {
          coinGeckoId: '',
          denom: denom || '',
          name: metadata.name || bankMetadata?.name || 'Unknown',
          decimals: metadata.decimals || bankMetadata?.decimals || 18,
          symbol: metadata.symbol || bankMetadata?.symbol || 'Unknown',
          logo: metadata.imageUrl || bankMetadata?.logo || 'unknown.png'
        }),
        tokenType: getTokenType(denom),
        tokenVerification: TokenVerification.External
      }

      if (denom.startsWith('ibc/')) {
        const { path, channelId, baseDenom } = (await getDenomTrace(denom)) || {
          path: '',
          channelId: '',
          baseDenom: metadata.symbol || 'Unknown'
        }

        return {
          ...meta,
          path,
          denom,
          baseDenom,
          channelId,
          tokenType: TokenType.Ibc,
          hash: denom.replace('ibc/', '')
        }
      }

      return meta
    })
  )
}

const generateExternalTokens = async () => {
  try {
    const response = (await externalTokenMetadataApi.get(
      'ibc/chain/injective-1/tokens'
    )) as {
      data: ApiTokenMetadata[]
    }

    if (!response.data || !Array.isArray(response.data)) {
      return
    }

    await fetchMetadata()
    await fetchSupplyDenoms()

    const filteredData = response.data.filter(
      ({ contractAddr }) =>
        !existingTokens.find((token) => token.denom === contractAddr)
    )
    const newExternalTokens = await formatApiTokenMetadata(filteredData)

    const tokens = shouldFlush
      ? newExternalTokens
      : [...existingExternalTokens, ...newExternalTokens]

    writeFileSync(
      'externalTokens.json',
      JSON.stringify(
        tokens.filter((token) => token),
        null,
        2
      )
    )
  } catch (e) {
    console.log('Error generateExternalTokens', e)

    return
  }
}

generateExternalTokens()
