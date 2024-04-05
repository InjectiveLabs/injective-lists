import { HttpRestClient } from '@injectivelabs/utils'
import {
  Network,
  getNetworkEndpoints,
  isMainnet,
  isTestnet
} from '@injectivelabs/networks'
import { TokenType } from '@injectivelabs/token-metadata'
import { symbolMeta } from '../data/symbolMeta'
import { untaggedSymbolMeta } from '../data/untaggedSymbolMeta'
import { Token, BankMetadata, TokenSymbolMeta } from '../types'

export const getDenomTrace = async (
  hash: string,
  network: Network,
  symbol?: string
): Promise<{
  path: string
  baseDenom: string
  channelId: string
}> => {
  if (!hash.startsWith('ibc/')) {
    return {
      path: '',
      channelId: '',
      baseDenom: symbol || untaggedSymbolMeta.Unknown.symbol
    }
  }

  const endpoints = getNetworkEndpoints(network)

  const ibcDenomTraceApi = new HttpRestClient(
    `${endpoints.rest}/ibc/apps/transfer/v1/denom_traces/`,
    {
      timeout: 2000
    }
  )

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
    console.error(`Failed to fetch denom trace for hash: ${hash}`, e)

    return {
      path: '',
      channelId: '',
      baseDenom: symbol || untaggedSymbolMeta.Unknown.symbol
    }
  }
}

export const getSymbolMeta = ({
  name,
  logo,
  symbol,
  decimals
}: {
  logo?: string
  name?: string
  symbol: string
  decimals?: number
}): TokenSymbolMeta => {
  const value = Object.values(symbolMeta).find(
    (meta) => meta.symbol.toLowerCase() === symbol.toLowerCase()
  )

  if (!value) {
    return {
      symbol: symbol,
      name: name || untaggedSymbolMeta.Unknown.name,
      logo: logo || untaggedSymbolMeta.Unknown.logo,
      coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
      decimals: decimals || untaggedSymbolMeta.Unknown.decimals
    }
  }

  return { ...value }
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

export const getNetworkFileName = (network: Network) => {
  if (network === Network.Staging) {
    return 'staging'
  }

  if (isMainnet(network)) {
    return 'mainnet'
  }

  if (isTestnet(network)) {
    return 'testnet'
  }

  return 'devnet'
}

export const tokensToDenomMap = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = token.denom.toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = token

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...token }

    return list
  }, {} as Record<string, Token>)
}

export const cw20TokensToDenomMap = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = (token?.address || token.denom).toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = token

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...token }

    return list
  }, {} as Record<string, Token>)
}

export const bankMetadataToDenomMap = (metadatas: BankMetadata[]) => {
  return metadatas.reduce((list, metadata) => {
    const formattedDenom = metadata.denom.toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = metadata

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...metadata }

    return list
  }, {} as Record<string, BankMetadata>)
}
