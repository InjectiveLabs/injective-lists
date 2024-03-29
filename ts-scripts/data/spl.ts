import { symbolMeta } from './symbolMeta'

export default [
  {
    ...symbolMeta.USDC,
    symbol: 'USDCso',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  },
  {
    ...symbolMeta.SOL,
    address: '',
    decimals: 9,
    isNative: true
  },
  {
    ...symbolMeta.PYTH,
    address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'
  },
  {
    ...symbolMeta.BSKT,
    address: '6gnCPhXtLnUD76HjQuSYPENLSZdG8RvDB1pTLM5aLSJA'
  }
]
