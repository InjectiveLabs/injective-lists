import { symbolMeta } from './symbolMeta'

export const devnetTokens = []

export const testnetTokens = [
  {
    ...symbolMeta.INJ,
    symbol: 'wINJ',
    name: 'Wrapped INJ',
    address: 'erc20:0xe1c64DDE0A990ac2435B05DCdac869a17fE06Bd2'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'wUSDT',
    name: 'Tether',
    address: 'erc20:0x719fF496ddf37C56F2A958676f630f417a4084aa'
  }
]

export const mainnetTokens = []
