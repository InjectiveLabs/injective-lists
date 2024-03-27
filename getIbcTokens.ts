import { HttpRestClient } from '@injectivelabs/utils'
import { writeFileSync } from 'node:fs'
import {
  Token,
  TokenType,
  TokenVerification
} from '@injectivelabs/token-metadata'

/*
experiment abstracting:
gh workflow
- name: Get IBC Tokens
  run: yarn --cwd packages/sdk-ui-ts get-ibc-tokens || true

private async fetchAndCacheDenomTraces()

from injective-ts
*/

type IbcTokenMetadata = {
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

async function ibcTokenMetadataToToken(
  ibcTokenMetadata: IbcTokenMetadata[]
): Promise<Token[]> {
  return await Promise.all(
    ibcTokenMetadata.map(async (metadata) => {
      const { path, channelId, baseDenom } = (await getDenomTrace(
        metadata.contractAddr
      )) || {
        path: '',
        channelId: '',
        baseDenom: metadata.symbol || 'Unknown'
      }

      return {
        name: metadata.name || 'Unknown',
        denom: metadata.contractAddr || '',
        logo: metadata.imageUrl || 'unknown.png',
        symbol: metadata.symbol || 'Unknown',
        decimals: metadata.decimals || 18,
        coinGeckoId: '',
        tokenType: TokenType.Ibc,
        tokenVerification: TokenVerification.External,

        ibc: {
          path,
          channelId,
          baseDenom,
          isNative: false,
          tokenType: TokenType.Ibc,
          decimals: metadata.decimals || 18,
          symbol: metadata.symbol || 'Unknown',
          hash: (metadata.contractAddr || '').replace('ibc/', '')
        }
      }
    })
  )
}

;(async () => {
  try {
    const response = (await ibcTokenMetadataApi.get(
      'ibc/chain/injective-1/tokens'
    )) as {
      data: IbcTokenMetadata[]
    }

    if (!response.data || !Array.isArray(response.data)) {
      return
    }

    const ibcTokens = await ibcTokenMetadataToToken(response.data)

    writeFileSync('ibcTokens.json', JSON.stringify(ibcTokens, null, 2))
  } catch (e) {
    console.log(e)

    return
  }
})()
