import { symbolMeta } from './symbolMeta'

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
