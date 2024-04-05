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

export type InsuranceFund = {
  deposit_denom: string
  insurance_pool_token_denom: string
  redemption_notice_period_duration: string
  balance: string
  total_share: string
  market_id: string
  market_ticker: string
  oracle_base: string
  oracle_quote: string
  oracle_type: string
  expiry: string
}
