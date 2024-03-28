import { HttpRestClient } from '@injectivelabs/utils'
import { TokenType } from '@injectivelabs/token-metadata'
import { symbolMeta } from '../../tokens/symbolMeta'

const ibcDenomTraceApi = new HttpRestClient(
  'https://lcd.injective.network/ibc/apps/transfer/v1/denom_traces/',
  {
    timeout: 2000
  }
)

export const getDenomTrace = async (
  hash: string
): Promise<
  | {
      path: string
      baseDenom: string
      channelId: string
    }
  | undefined
> => {
  if (!hash.startsWith('ibc/')) {
    return Promise.resolve(undefined)
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
    return Promise.resolve(undefined)
  }
}

export const getSymbolMeta = ({
  denom,
  symbol
}: {
  denom: string
  symbol: string
}) => {
  const value = Object.values(symbolMeta).find(
    (meta) => meta.symbol.toLowerCase() === symbol.toLowerCase()
  )

  if (!value) {
    return
  }

  return { ...value, denom }
}

export const getTokenType = (denom: string): TokenType => {
  if (!denom) {
    return TokenType.Unknown
  }

  if (denom.startsWith('peggy') || denom.startsWith('0x')) {
    return TokenType.Erc20
  }

  if (denom.startsWith('ibc/')) {
    return TokenType.Ibc
  }

  if (denom.startsWith('factory')) {
    const subDenom = denom.split('/').pop()

    if (!subDenom) {
      return TokenType.Unknown
    }

    return subDenom.startsWith('inj') ? TokenType.Cw20 : TokenType.TokenFactory
  }

  return TokenType.Unknown
}
