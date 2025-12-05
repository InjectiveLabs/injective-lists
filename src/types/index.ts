import {
  TokenInfo,
  TokenSource,
  ContractInfo,
  MarketingInfo
} from '@injectivelabs/sdk-ts'

export * from './chain'

export interface TokenSymbolMeta {
  name: string
  logo: string
  symbol: string
  decimals: number
  coinGeckoId: string
  subdenom?: string
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
  address: string
  tokenType: string
  description?: string
  tokenVerification: string
  externalLogo?: string
  isNative?: boolean
  source?: string
  hash?: string
  path?: string
  channelId?: string
  baseDenom?: string
}

export interface IbcDenomTrace {
  path: string
  baseDenom: string
  channelId: string
}

export interface Cw20ContractSource {
  address: string
  info?: ContractInfo
  tokenInfo?: TokenInfo
  contractInfo?: ContractInfo
  marketingInfo?: MarketingInfo
}

export interface MarketSlugId {
  slug: string
  marketId: string
}

export type SwapRoute = {
  steps: string[]
  source_denom: string
  target_denom: string
}

export type ChainConfig = {
  proposalId: number
  blockHeight: number
  proposalMsg: string
  disableMaintenance: boolean
}

export type EvmToken = {
  name: string
  address: string
  symbol: string
  decimals: number
  chainId: number
  logoUri?: string
}
