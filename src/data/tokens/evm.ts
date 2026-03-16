import { symbolMeta } from './symbolMeta'
import { untaggedSymbolMeta } from './untaggedSymbolMeta'

export const devnetTokens = []

export const testnetTokens = [
  {
    ...symbolMeta.INJ,
    symbol: 'DINJ',
    name: 'Demo INJ',
    address: 'erc20:0xe1c64DDE0A990ac2435B05DCdac869a17fE06Bd2'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'DUSDT',
    name: 'Demo Tether',
    address: 'erc20:0x719fF496ddf37C56F2A958676f630f417a4084aa'
  },
  {
    ...symbolMeta.INJ,
    symbol: 'WINJ',
    name: 'Wrapped INJ',
    address: 'erc20:0x0000000088827d2d103ee2d9A6b781773AE03FfB'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDC',
    address: 'erc20:0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d'
  },
  {
    ...untaggedSymbolMeta.Unknown,
    decimals: 18,
    symbol: 'erc20:0xD8F3573F6dC7bedD4C5246F2aAe90df47854A229',
    address: 'erc20:0xD8F3573F6dC7bedD4C5246F2aAe90df47854A229'
  }
]

export const mainnetTokens = [
  {
    ...symbolMeta.INJ,
    symbol: 'WINJ',
    name: 'Wrapped INJ',
    address: 'erc20:0x0000000088827d2d103ee2d9A6b781773AE03FfB'
  }
]
