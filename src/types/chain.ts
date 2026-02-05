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
  address: string
  display?: string
  decimals: number
  description: string
}
