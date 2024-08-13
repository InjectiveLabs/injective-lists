import { TokenSource } from '@injectivelabs/sdk-ts'
import { symbolMeta } from './symbolMeta'
import { Cw20TokenSource } from '../types'

export const devnetHardcodedCw20Denoms = [
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku',
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1q6kpxy6ar5lkxqudjvryarrrttmakwsvzkvcyh',
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1q6zlut7gtkzknkk773jecujwsdkgq882akqksk',
  'factory/inj1hdvy6tl89llqy3ze8lv6mz5qh66sx9enn0jxg6/inj12sqy9uzzl3h3vqxam7sz9f0yvmhampcgesh3qw'
]

export const devnetHardcodedBankMetadata = devnetHardcodedCw20Denoms.map(
  (denom) => {
    const name = denom.split('/').pop()

    return {
      name,
      denom,
      address: denom,
      logo: '',
      symbol: '',
      display: '',
      description: '',
      decimals: 0
    }
  }
)

export const devnetTokens: Cw20TokenSource[] = []

export const testnetTokens: Cw20TokenSource[] = [
  {
    ...symbolMeta.USDC,
    symbol: 'USDCet',
    address: 'inj12sqy9uzzl3h3vqxam7sz9f0yvmhampcgesh3qw'
  },
  {
    ...symbolMeta.SOL,
    address: 'inj12ngevx045zpvacus9s6anr258gkwpmthnz80e9'
  },
  {
    ...symbolMeta.hINJ,
    address: 'inj1mz7mfhgx8tuvjqut03qdujrkzwlx9xhcj6yldc'
  }
]

export const mainnetTokens: Cw20TokenSource[] = [
  {
    ...symbolMeta.wBTC,
    decimals: 18,
    source: TokenSource.Ethereum,
    address: 'inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku'
  },
  {
    ...symbolMeta.wEth,
    decimals: 8,
    source: TokenSource.Arbitrum,
    address: 'inj1plsk58sxqjw9828aqzeskmc8xy9eu5kppw3jg4'
  },
  {
    ...symbolMeta.wEth,
    decimals: 8,
    source: TokenSource.EthereumWh,
    address: 'inj1k9r62py07wydch6sj5sfvun93e4qe0lg7jyatc'
  },
  {
    ...symbolMeta.INJ,
    symbol: 'INJbsc',
    source: TokenSource.BinanceSmartChain,
    address: 'inj1xcgprh58szttp0vqtztvcfy34tkpupr563ua40'
  },
  {
    ...symbolMeta.INJ,
    symbol: 'INJet',
    source: TokenSource.EthereumWh,
    address: 'inj1v8gg4wzfauwf9l7895t0eyrrkwe65vh5n7dqmw'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'USDTbsc',
    source: TokenSource.BinanceSmartChain,
    address: 'inj1l9eyrnv3ret8da3qh8j5aytp6q4f73crd505lj'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'USDTet',
    source: TokenSource.EthereumWh,
    address: 'inj18zykysxw9pcvtyr9ylhe0p5s7yzf6pzdagune8'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'USDTap',
    source: TokenSource.Aptos,
    address: 'inj13yrhllhe40sd3nj0lde9azlwfkyrf2t9r78dx5'
  },
  {
    ...symbolMeta.USDT,
    symbol: 'USDTso',
    source: TokenSource.Solana,
    address: 'inj1qjn06jt7zjhdqxgud07nylkpgnaurq6xc5c4fd'
  },
  {
    ...symbolMeta.USDC,
    name: 'USD Coin (legacy)',
    symbol: 'USDCet',
    source: TokenSource.EthereumWh,
    address: 'inj1q6zlut7gtkzknkk773jecujwsdkgq882akqksk'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDCso',
    source: TokenSource.Solana,
    address: 'inj12pwnhtv7yat2s30xuf4gdk9qm85v4j3e60dgvu'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDCarb',
    source: TokenSource.Arbitrum,
    address: 'inj1lmcfftadjkt4gt3lcvmz6qn4dhx59dv2m7yv8r'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDCbsc',
    source: TokenSource.BinanceSmartChain,
    address: 'inj1dngqzz6wphf07fkdam7dn55t8t3r6qenewy9zu'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDCpoly',
    source: TokenSource.Polygon,
    address: 'inj19s2r64ghfqq3py7f5dr0ynk8yj0nmngca3yvy3'
  },
  {
    ...symbolMeta.SUSHI,
    name: 'SUSHI FIGHTER',
    logo: 'sushi-inj.png',
    address: 'inj1n73yuus64z0yrda9hvn77twkspc4uste9j9ydd'
  },
  {
    ...symbolMeta.DOT,
    address: 'inj1spzwwtr2luljr300ng2gu52zg7wn7j44m92mdf'
  },
  {
    ...symbolMeta.SOL,
    symbol: 'SOLlegacy',
    name: 'Solana (legacy)',
    address: 'inj1sthrn5ep8ls5vzz8f9gp89khhmedahhdkqa8z3'
  },
  {
    ...symbolMeta.XPLA,
    address: 'inj1j08452mqwadp8xu25kn9rleyl2gufgfjqjvewe'
  },
  {
    ...symbolMeta.AVAX,
    address: 'inj18a2u6az6dzw528rptepfg6n49ak6hdzkny4um6'
  },
  {
    ...symbolMeta.BONK,
    address: 'inj14rry9q6dym3dgcwzq79yay0e9azdz55jr465ch'
  },
  {
    ...symbolMeta.CHZ,
    decimals: 8,
    symbol: 'CHZlegacy',
    name: 'Chiliz (legacy)',
    address: 'inj1q6kpxy6ar5lkxqudjvryarrrttmakwsvzkvcyh'
  },
  {
    ...symbolMeta.QAT,
    decimals: 8,
    address: 'inj1m4g54lg2mhhm7a4h3ms5xlyecafhe4macgsuen'
  },
  {
    ...symbolMeta.LDO,
    decimals: 8,
    address: 'inj1me6t602jlndzxgv2d7ekcnkjuqdp7vfh4txpyy'
  },
  {
    ...symbolMeta.ARB,
    decimals: 8,
    symbol: 'ARBlegacy',
    name: 'Arbitrum (legacy)',
    source: TokenSource.Arbitrum,
    address: 'inj1d5vz0uzwlpfvgwrwulxg6syy82axa58y4fuszd'
  },
  {
    ...symbolMeta.BRZ,
    address: 'inj14jesa4q248mfxztfc9zgpswkpa4wx249mya9kk'
  },
  {
    ...symbolMeta.ASTR,
    address: 'inj1mhmln627samtkuwe459ylq763r4n7n69gxxc9x'
  },
  {
    ...symbolMeta.ALPHA,
    decimals: 8,
    address: 'inj1zwnsemwrpve3wrrg0njj89w6mt5rmj9ydkc46u'
  },
  {
    ...symbolMeta.WMATIC,
    decimals: 8,
    symbol: 'WMATIClegacy',
    source: TokenSource.Polygon,
    name: 'Wrapped Matic (legacy)',
    address: 'inj1dxv423h8ygzgxmxnvrf33ws3k94aedfdevxd8h'
  },
  {
    ...symbolMeta.VATRENI,
    decimals: 8,
    source: TokenSource.Polygon,
    address: 'inj1tn457ed2gg5vj2cur5khjjw63w73y3xhyhtaay'
  },
  {
    ...symbolMeta.WKLAY,
    address: 'inj14cl67lprqkt3pncjav070gavaxslc0tzpc56f4'
  },
  {
    ...symbolMeta.PYTH,
    symbol: 'PYTHlegacy',
    name: 'Pyth Network (legacy)',
    address: 'inj1tjcf9497fwmrnk22jfu5hsdq82qshga54ajvzy'
  },
  {
    ...symbolMeta.NINJ,
    address: 'inj13xlpypcwl5fuc84uhqzzqumnrcfpptyl6w3vrf'
  },
  {
    ...symbolMeta.DOJO,
    address: 'inj1zdj9kqnknztl2xclm5ssv25yre09f8908d4923'
  },
  {
    ...symbolMeta.PUNK,
    address: 'inj1wmrzttj7ms7glplek348vedx4v2ls467n539xt'
  },
  {
    ...symbolMeta.hINJ,
    address: 'inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc'
  },
  {
    ...symbolMeta.DINJ,
    address: 'inj134wfjutywny9qnyux2xgdmm0hfj7mwpl39r3r9'
  },
  {
    ...symbolMeta.XNJ,
    address: 'inj17pgmlk6fpfmqyffs205l98pmnmp688mt0948ar'
  },
  {
    ...symbolMeta.KAGE,
    address: 'inj1l49685vnk88zfw2egf6v65se7trw2497wsqk65'
  },
  {
    ...symbolMeta.nINJ,
    address: 'inj1rmzufd7h09sqfrre5dtvu5d09ta7c0t4jzkr2f'
  },
  {
    ...symbolMeta.nATOM,
    address: 'inj16jf4qkcarp3lan4wl2qkrelf4kduvvujwg0780'
  },
  {
    ...symbolMeta.nUSDT,
    address: 'inj1cy9hes20vww2yr6crvs75gxy5hpycya2hmjg9s'
  },
  {
    ...symbolMeta.nWETH,
    address: 'inj1kehk5nvreklhylx22p3x0yjydfsz9fv3fvg5xt'
  },
  {
    ...symbolMeta.BSKT,
    source: TokenSource.Solana,
    address: 'inj193340xxv49hkug7r65xzc0l40tze44pee4fj94'
  },
  {
    ...symbolMeta.NONJA,
    address: 'inj1fu5u29slsg2xtsj7v5la22vl4mr4ywl7wlqeck'
  },
  {
    ...symbolMeta.NLC,
    address: 'inj1r9h59ke0a77zkaarr4tuq25r3lt9za4r2mgyf4'
  },
  {
    ...symbolMeta.BONJO,
    address: 'inj19w5lfwk6k9q2d8kxnwsu4962ljnay85f9sgwn6'
  },
  {
    ...symbolMeta.COKE,
    address: 'inj14eaxewvy7a3fk948c3g3qham98mcqpm8v5y0dp'
  },
  {
    ...symbolMeta.SHROOM,
    address: 'inj1300xcg9naqy00fujsr9r8alwk7dh65uqu87xm8'
  },
  {
    ...symbolMeta.ELON,
    address: 'inj10pqutl0av9ltrw9jq8d3wjwjayvz76jhfcfza0'
  },
  {
    ...symbolMeta.nTIA,
    address: 'inj1fzquxxxam59z6fzewy2hvvreeh3m04x83zg4vv'
  },
  {
    ...symbolMeta.bnUSD,
    address: 'inj1qspaxnztkkzahvp6scq6xfpgafejmj2td83r9j'
  }
]
