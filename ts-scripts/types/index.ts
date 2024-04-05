import { TokenSource } from '@injectivelabs/token-metadata'

export * from './chain'

// todo: import from injective-ts after package bumping
export interface TokenSymbolMeta {
  name: string
  logo: string
  symbol: string
  decimals: number
  coinGeckoId: string
}

export interface AlchemyTokenSource {
  decimals: number
  logo: string
  name: string
  symbol: string
}

export interface PeggyTokenSource extends TokenSymbolMeta {
  address: string
}

export interface IbcTokenSource extends TokenSymbolMeta {
  isNative?: boolean
  channelId: string
  source: TokenSource
  path: string
  baseDenom: string
  hash: string
}

export interface Cw20TokenSource extends TokenSymbolMeta {
  source?: TokenSource
  address: string
}

export interface TokenFactorySource extends TokenSymbolMeta {
  creator: string
}

export interface Token {
  name: string
  logo: string
  symbol: string
  decimals: number
  coinGeckoId: string
  denom: string
  address?: string
  tokenType: string
  tokenVerification: string
  isNative?: boolean
  source?: string
  hash?: string
  path?: string
  channelId?: string
  baseDenom?: string
}
