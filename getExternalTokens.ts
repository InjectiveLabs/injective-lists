import { HttpRestClient } from '@injectivelabs/utils'
import { writeFileSync } from 'node:fs'
import {
  Token,
  TokenType,
  TokenVerification
} from '@injectivelabs/token-metadata'
import { symbolMeta } from './tokens/symbolMeta'

/*
experiment abstracting:
gh workflow
- name: Get IBC Tokens
  run: yarn --cwd packages/sdk-ui-ts get-ibc-tokens || true

private async fetchAndCacheDenomTraces()

from injective-ts
*/

type ApiTokenMetadata = {
  name: string
  symbol: string
  contractAddr: string
  decimals: number
  numberOfPools: number
  imageUrl: string
  isTrading: boolean
}

const ibcTokenMetadataApi = new HttpRestClient('https://api.tfm.com/api/v1/', {
  timeout: 2000
})

const ibcDenomTraceApi = new HttpRestClient(
  'https://lcd.injective.network/ibc/apps/transfer/v1/denom_traces/',
  {
    timeout: 2000
  }
)

async function getDenomTrace(hash: string): Promise<
  | {
      path: string
      baseDenom: string
      channelId: string
    }
  | undefined
> {
  if (!hash.startsWith('ibc/')) {
    return
  }

  try {
    const { data } = (await ibcDenomTraceApi.get(hash.replace('ibc/', ''))) as {
      data: { denom_trace: { path: string; base_denom: string } }
    }

    return {
      path: data.denom_trace.path,
      baseDenom: data.denom_trace.base_denom,
      channelId: data.denom_trace.path.split('/').pop() as string
    }
  } catch (e) {
    return
  }
}

function getSymbolMeta(metadata: ApiTokenMetadata) {
  const value = Object.values(symbolMeta).find(
    (meta) => meta.symbol.toLowerCase() === metadata.symbol.toLowerCase()
  )

  if (!value) {
    return
  }

  return { ...value, denom: metadata.contractAddr }
}

async function formatApiTokenMetadata(
  tokenMetadata: ApiTokenMetadata[]
): Promise<any[]> {
  return await Promise.all(
    tokenMetadata.map(async (metadata) => {
      const meta = {
        isNative: false,
        ...(getSymbolMeta(metadata) || {
          coinGeckoId: '',
          name: metadata.name || 'Unknown',
          decimals: metadata.decimals || 18,
          denom: metadata.contractAddr || '',
          symbol: metadata.symbol || 'Unknown',
          logo: metadata.imageUrl || 'unknown.png'
        }),
        tokenType: TokenType.Unknown,
        tokenVerification: TokenVerification.External
      }

      if (metadata.contractAddr.startsWith('ibc/')) {
        const { path, channelId, baseDenom } = (await getDenomTrace(
          metadata.contractAddr
        )) || {
          path: '',
          channelId: '',
          baseDenom: metadata.symbol || 'Unknown'
        }

        return {
          ...meta,
          path,
          baseDenom,
          channelId,
          tokenType: TokenType.Ibc,
          denom: metadata.contractAddr,
          hash: metadata.contractAddr.replace('ibc/', '')
        }
      }

      return meta
    })
  )
}

;(async () => {
  try {
    const response = (await ibcTokenMetadataApi.get(
      'ibc/chain/injective-1/tokens'
    )) as {
      data: ApiTokenMetadata[]
    }

    if (!response.data || !Array.isArray(response.data)) {
      return
    }

    const ibcTokens = await formatApiTokenMetadata(response.data)

    writeFileSync('externalTokens.json', JSON.stringify(ibcTokens, null, 2))
  } catch (e) {
    console.log(e)

    return
  }
})()
