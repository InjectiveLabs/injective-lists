import {
  TokenType,
  TokenVerification,
  TokenSource
} from '@injectivelabs/token-metadata'

export type ApiTokenMetadata = {
  name: string
  symbol: string
  contractAddr: string
  decimals: number
  numberOfPools: number
  imageUrl: string
  isTrading: boolean
}

export type BankMetadata = {
  logo: string
  name: string
  denom: string
  symbol: string
  decimals: number
  description: string
}

export type Coin = {
  denom: string
  amount: string
}

export type DenomUnit = {
  denom: string
  exponent: number
  aliases: string[]
}

export type Metadata = {
  description: string
  denom_units: DenomUnit[]
  base: string
  display: string
  name: string
  symbol: string
  uri: string
  uriHash: string
}

export type ExplorerCw20Contract = {
  label: string
  address: string
  creator: string
  cw20_metadata: {
    token_info: {
      name: string
      symbol: string
      decimals: number
      total_supply: string
    }
  }
}

export type ExplorerPagination = {
  total: number
  from: number
  to: number
}

// todo: import from injective-ts after package bumping
export interface TokenSymbolMeta {
  name: string
  logo: string
  symbol: string
  decimals: number
  coinGeckoId: string
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
