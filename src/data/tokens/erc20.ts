import { symbolMeta } from './symbolMeta'
import { untaggedSymbolMeta } from './untaggedSymbolMeta'

export const devnetTokens = [
  {
    ...symbolMeta.INJ,
    address: '0xBe8d71D26525440A03311cc7fa372262c5354A3c'
  }
]

export const testnetTokens = [
  {
    ...symbolMeta.INJ,
    address: '0x5512c04B6FF813f3571bDF64A1d74c98B5257332'
  },
  {
    ...symbolMeta.APE,
    address: '0x44d63c7FC48385b212aB397aB91A2637ec964634'
  },
  {
    ...symbolMeta.USDT,
    address: '0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5'
  },
  {
    ...symbolMeta.QAT,
    address: '0x5Ac3A2F6205a481C7a8984E4291E450e52cd0369'
  }
]

export const mainnetTokens = [
  {
    ...symbolMeta.wBTC,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
  },
  {
    ...symbolMeta.wEth,
    isNative: true,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    ...symbolMeta.INJ,
    address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30'
  },
  {
    ...symbolMeta.USDT,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDClegacy',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  {
    ...symbolMeta.GRT,
    address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
  },
  {
    ...symbolMeta.SNX,
    address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'
  },
  {
    ...symbolMeta.BNB,
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
  },
  {
    ...symbolMeta.AAVE,
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'
  },
  {
    ...symbolMeta.YFI,
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
  },
  { ...symbolMeta.COMP, address: '0xc00e94Cb662C3520282E6f5717214004A7f26888' },
  { ...symbolMeta.ZRX, address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498' },
  {
    ...symbolMeta.MATIC,
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
  },
  { ...symbolMeta.UNI, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { ...symbolMeta.DAI, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { ...symbolMeta.LINK, address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  {
    ...symbolMeta.SUSHI,
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'
  },
  { ...symbolMeta.AXS, address: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b' },
  {
    ...symbolMeta['1INCH'],
    address: '0x111111111117dC0aa78b770fA6A738034120C302'
  },
  { ...symbolMeta.BAT, address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF' },
  { ...symbolMeta.BUSD, address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53' },
  { ...symbolMeta.CEL, address: '0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d' },
  { ...symbolMeta.CELL, address: '0x26c8AFBBFE1EBaca03C2bB082E69D0476Bffe099' },
  {
    ...symbolMeta.DEFI5,
    address: '0xfa6de2697D59E88Ed7Fc4dFE5A33daC43565ea41'
  },
  { ...symbolMeta.ENJ, address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c' },
  { ...symbolMeta.EVAI, address: '0x50f09629d0afDF40398a3F317cc676cA9132055c' },
  { ...symbolMeta.FTM, address: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870' },
  { ...symbolMeta.HT, address: '0x6f259637dcD74C767781E37Bc6133cd6A68aa161' },
  { ...symbolMeta.NEXO, address: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206' },
  { ...symbolMeta.NOIA, address: '0xa8c8CfB141A3bB59FEA1E2ea6B79b5ECBCD7b6ca' },
  {
    ...symbolMeta.OCEAN,
    address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48'
  },
  { ...symbolMeta.PAXG, address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78' },
  { ...symbolMeta.POOL, address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e' },
  { ...symbolMeta.RUNE, address: '0x3155BA85D5F96b2d030a4966AF206230e46849cb' },
  { ...symbolMeta.SHIB, address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  {
    ...symbolMeta.STARS,
    address: '0xc55c2175E90A46602fD42e931f62B3Acc1A013Ca'
  },
  { ...symbolMeta.STT, address: '0xaC9Bb427953aC7FDDC562ADcA86CF42D988047Fd' },
  { ...symbolMeta.SWAP, address: '0xcc4304a31d09258b0029ea7fe63d032f52e44efe' },
  { ...symbolMeta.UMA, address: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828' },
  { ...symbolMeta.UTK, address: '0xdc9Ac3C20D1ed0B540dF9b1feDC10039Df13F99c' },
  { ...symbolMeta.ATOM, address: '0x8D983cb9388EaC77af0474fA441C4815500Cb7BB' },
  {
    ...symbolMeta.LUNA,
    address: '0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9'
  },
  {
    ...symbolMeta.UST,
    address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD'
  },
  {
    ...symbolMeta.GF,
    address: '0xaaef88cea01475125522e117bfe45cf32044e238'
  },
  {
    ...symbolMeta.XBX,
    address: '0x080B12E80C9b45e97C23b6ad10a16B3e2a123949'
  },
  {
    ...symbolMeta.TAB,
    address: '0x36B3D7ACe7201E28040eFf30e815290D7b37ffaD'
  },
  {
    ...symbolMeta.AXL,
    address: '0x3eacbDC6C382ea22b78aCc158581A55aaF4ef3Cc'
  },
  {
    ...symbolMeta.APE,
    address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381'
  },
  {
    ...symbolMeta.DOT,
    address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080'
  },
  {
    ...symbolMeta.SOMM,
    address: '0xa670d7237398238DE01267472C6f13e5B8010FD1'
  },
  {
    ...symbolMeta.ETHBTCTREND,
    address: '0x6b7f87279982d919Bbf85182DDeAB179B366D8f2'
  },
  {
    ...symbolMeta.STEADYETH,
    address: '0x3F07A84eCdf494310D397d24c1C78B041D2fa622'
  },
  {
    ...symbolMeta.STEADYBTC,
    address: '0x4986fD36b6b16f49b43282Ee2e24C5cF90ed166d'
  },
  {
    ...symbolMeta.CHZ,
    address: '0x3506424F91fD33084466F402d5D97f05F8e3b4AF'
  },
  {
    ...symbolMeta.QAT,
    address: '0x1902e18fEB1234D00d880f1fACA5C8d74e8501E9'
  },
  {
    ...symbolMeta.PUGGO,
    address: '0xf9a06dE3F6639E6ee4F079095D5093644Ad85E8b'
  },
  {
    ...symbolMeta.LDO,
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'
  },
  {
    ...symbolMeta.ARB,
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548'
  },
  {
    ...symbolMeta.BRZ,
    address: '0x420412E765BFa6d85aaaC94b4f7b708C89be2e2B'
  },
  {
    ...symbolMeta.ALPHA,
    address: '0x138C2F1123cF3f82E4596d097c118eAc6684940B'
  },
  {
    ...symbolMeta.PEPE,
    address: '0x6982508145454ce325ddbe47a25d4ec3d2311933'
  },
  {
    ...symbolMeta.WASSIE,
    address: '0x2c95d751da37a5c1d9c5a7fd465c1d50f3d96160'
  },
  {
    ...symbolMeta.RIBBIT,
    address: '0xb794Ad95317f75c44090f64955954C3849315fFe'
  },
  {
    ...symbolMeta.LAMBO,
    address: '0x3d2b66BC4f9D6388BD2d97B95b565BE1686aEfB3'
  },
  {
    ...symbolMeta.XRP,
    address: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe'
  },
  {
    ...symbolMeta.RAI,
    address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919'
  },
  {
    ...symbolMeta.BTSG,
    address: '0x05079687D35b93538cbd59fe5596380cae9054A9'
  },
  {
    ...symbolMeta.CVR,
    address: '0x3c03b4ec9477809072ff9cc9292c9b25d4a8e6c6'
  },
  {
    ...symbolMeta.QNT,
    address: '0x4a220e6096b25eadb88358cb44068a3248254675'
  },
  {
    ...symbolMeta.WSTETH,
    address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'
  },
  {
    ...symbolMeta.DYDX,
    address: '0x92d6c1e31e14520e676a687f0a93788b716beff5'
  },
  {
    ...symbolMeta.XAC,
    address: '0xDe4C5a791913838027a2185709E98c5C6027EA63'
  },
  {
    ...symbolMeta.STETH,
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
  },
  {
    ...symbolMeta.LYM,
    address: '0xc690f7c7fcffa6a82b79fab7508c466fefdfc8c5'
  },
  {
    ...symbolMeta.OMI,
    address: '0xed35af169af46a02ee13b9d79eb57d6d68c1749e'
  },
  {
    ...symbolMeta.ORAI,
    address: '0x4c11249814f11b9346808179Cf06e71ac328c1b5'
  },
  {
    ...symbolMeta.USDYet,
    address: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C'
  },
  {
    ...symbolMeta['USDC-MPL'],
    address: '0xf875aef00C4E21E9Ab4A335eB36A1175Ab00424A'
  },
  {
    ...symbolMeta.ZIG,
    address: '0xb2617246d0c6c0087f18703d576831899ca94f01'
  },
  {
    ...symbolMeta.SKIPBIDIDOBDOBDOBYESYESYESYES,
    address: '0x5085202d0A4D8E4724Aa98C42856441c3b97Bc6d'
  },
  {
    ...symbolMeta.MEMEME,
    address: '0x1A963Df363D01EEBB2816b366d61C917F20e1EbE'
  },
  {
    ...symbolMeta.MAGA,
    address: '0x576e2BeD8F7b46D34016198911Cdf9886f78bea7'
  },
  {
    ...symbolMeta.SDEX,
    address: '0x5DE8ab7E27f6E7A1fFf3E5B337584Aa43961BEeF'
  },
  {
    ...symbolMeta.OX,
    address: '0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f'
  },
  {
    ...symbolMeta.FUSDT,
    address: '0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7'
  },
  {
    ...symbolMeta.PVP,
    address: '0x9B44793a0177C84DD01AD81137db696531902871'
  },
  {
    ...symbolMeta.POOR,
    address: '0x9D433Fa992C5933D6843f8669019Da6D512fd5e9'
  },
  {
    ...symbolMeta.VRD,
    address: '0xf25304e75026E6a35FEDcA3B0889aE5c4D3C55D8'
  },
  {
    ...symbolMeta.NONE,
    address: '0x903ff0ba636E32De1767A4B5eEb55c155763D8B7'
  },
  {
    ...symbolMeta.APP,
    address: '0xC5d27F27F08D1FD1E3EbBAa50b3442e6c0D50439'
  },
  {
    ...symbolMeta.GYEN,
    address: '0xC08512927D12348F6620a698105e1BAac6EcD911'
  },
  {
    ...symbolMeta.BEAST,
    address: '0xA4426666addBE8c4985377d36683D17FB40c31Be'
  },
  {
    ...symbolMeta.GLTO,
    address: '0xd73175f9eb15eee81745d367ae59309Ca2ceb5e2'
  },
  {
    ...symbolMeta.USDE,
    address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3'
  },
  {
    ...symbolMeta.BAND,
    address: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55'
  },
  {
    ...symbolMeta.BSKT,
    address: '0xbC0899E527007f1B8Ced694508FCb7a2b9a46F53'
  },
  {
    ...symbolMeta.ROOT,
    address: '0xa3d4BEe77B05d4a0C943877558Ce21A763C4fa29'
  },
  {
    ...symbolMeta.ENA,
    address: '0x57e114b691db790c35207b2e685d4a43181e6061'
  },
  {
    ...symbolMeta.OMNI,
    address: '0x36e66fbbce51e4cd5bd3c62b637eb411b18949d4'
  },
  {
    ...symbolMeta.SUSDE,
    address: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497'
  },
  {
    ...symbolMeta.ezETH,
    address: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110'
  },
  {
    ...symbolMeta.PYUSD,
    address: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'
  },
  {
    ...symbolMeta.ELON,
    address: '0x43123e1d077351267113ada8bE85A058f5D492De'
  },
  {
    ...symbolMeta.IOTX,
    address: '0x6fB3e0A217407EFFf7Ca062D46c26E5d60a14d69'
  },
  {
    ...symbolMeta.FET,
    address: '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85'
  },
  {
    ...symbolMeta.wUSDM,
    address: '0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812'
  },
  {
    ...symbolMeta.TON,
    address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1'
  },
  {
    ...symbolMeta.wUSDL,
    address: '0x7751E2F4b8ae93EF6B79d86419d42FE3295A4559'
  },
  {
    ...symbolMeta.USD1,
    address: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d'
  }
]
