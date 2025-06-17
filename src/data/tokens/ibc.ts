import { TokenSource } from '@injectivelabs/sdk-ts'
import { symbolMeta } from './symbolMeta'
import { untaggedSymbolMeta } from './untaggedSymbolMeta'
import { IbcTokenSource } from '../../types'

export const testnetTokens: IbcTokenSource[] = [
  {
    ...symbolMeta.ASTRO,
    isNative: true,
    baseDenom: 'ASTRO',
    channelId: 'channel-13',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-13',
    hash: 'E8AC6B792CDE60AB208CA060CA010A3881F682A7307F624347AB71B6A0B0BF89'
  },
  {
    ...symbolMeta.TEVMOS,
    isNative: true,
    baseDenom: 'atevmos',
    channelId: 'channel-1',
    path: 'transfer/channel-76996',
    source: TokenSource.Cosmos,
    hash: '300B5A980CA53175DBAC918907B47A2885CADD17042AD58209E777217D64AF20'
  },
  {
    ...symbolMeta.XION,
    isNative: true,
    baseDenom: 'uxion',
    channelId: 'channel-489',
    path: 'transfer/channel-489',
    source: TokenSource.Cosmos,
    hash: 'DAB0823884DB5785F08EE136EE9EB362E166F4C7455716641B03E93CE7F14193'
  }
]

export const mainnetTokens: IbcTokenSource[] = [
  {
    ...symbolMeta.USDT,
    symbol: 'USDTkv',
    isNative: true,
    channelId: 'channel-143',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-143',
    baseDenom: 'erc20/tether/usdt',
    hash: '4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'axlUSDC',
    baseDenom: 'uusdc',
    channelId: 'channel-84',
    source: TokenSource.Axelar,
    path: 'transfer/channel-84',
    hash: '7E1AF94AD246BE522892751046F0C959B768642E5671CC3742264068D49553C0'
  },
  {
    ...symbolMeta.USDC,
    baseDenom: 'uusdc',
    isNative: true,
    channelId: 'channel-148',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-148',
    hash: '2CBC2EA121AE42563B08028466F37B600F2D7D4282342DE938283CC3FB2BC00E'
  },
  {
    ...symbolMeta.USDC,
    symbol: 'USDCgateway',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.EthereumWh,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/GGh9Ufn1SeDGrhzEkMyRKt5568VbbxZK2yvWNsd6PbXt',
    hash: '7BE71BB68C781453F6BB10114F8E2DF8DC37BA791C502F5389EA10E7BEA68323'
  },
  {
    ...symbolMeta.SOL,
    channelId: 'channel-183',
    source: TokenSource.Solana,
    path: 'transfer/channel-183',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/8sYgCzLRJC3J7qPn2bNbx6PiGcarhyx8rBhVaNnfvHCA',
    hash: 'A8B0B746B5AB736C2D8577259B510D56B8AF598008F68041E3D634BCDE72BE97'
  },
  {
    ...symbolMeta.ATOM,
    isNative: true,
    baseDenom: 'uatom',
    channelId: 'channel-1',
    path: 'transfer/channel-1',
    source: TokenSource.Cosmos,
    hash: 'C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9'
  },
  {
    ...symbolMeta.UPHOTON,
    isNative: true,
    baseDenom: 'uphoton',
    path: 'transfer/channel-2',
    channelId: 'channel-2',
    source: TokenSource.Cosmos,
    hash: '48BC9C6ACBDFC1EBA034F1859245D53EA4BF74147189D66F27C23BF966335DFB'
  },
  {
    ...symbolMeta.LUNA,
    isNative: true,
    baseDenom: 'uluna',
    channelId: 'channel-4',
    path: 'transfer/channel-4',
    source: TokenSource.Cosmos,
    hash: 'B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395'
  },
  {
    ...symbolMeta.UST,
    isNative: true,
    baseDenom: 'uusd',
    channelId: 'channel-4',
    path: 'transfer/channel-4',
    source: TokenSource.Cosmos,
    hash: 'B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C'
  },
  {
    ...symbolMeta.OSMO,
    isNative: true,
    baseDenom: 'uosmo',
    channelId: 'channel-8',
    path: 'transfer/channel-8',
    source: TokenSource.Cosmos,
    hash: '92E0120F15D037353CFB73C14651FC8930ADC05B93100FD7754D3A689E53B333'
  },
  {
    ...symbolMeta.HUAHUA,
    isNative: true,
    baseDenom: 'uhuahua',
    channelId: 'channel-76',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-76',
    hash: 'E7807A46C0B7B44B350DA58F51F278881B863EC4DCA94635DAB39E52C30766CB'
  },
  {
    ...symbolMeta.JUNO,
    isNative: true,
    baseDenom: 'ujuno',
    channelId: 'channel-78',
    path: 'transfer/channel-78',
    source: TokenSource.Cosmos,
    hash: 'D50E26996253EBAA8C684B9CD653FE2F7665D7BDDCA3D48D5E1378CF6334F211'
  },
  {
    ...symbolMeta.WHALE,
    isNative: true,
    baseDenom: 'uwhale',
    channelId: 'channel-102',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-102',
    hash: 'D6E6A20ABDD600742D22464340A7701558027759CE14D12590F8EA869CCCF445'
  },
  {
    ...symbolMeta.NOIS,
    isNative: true,
    baseDenom: 'unois',
    channelId: 'channel-138',
    path: 'transfer/channel-138',
    source: TokenSource.Cosmos,
    hash: 'DD9182E8E2B13C89D6B4707C7B43E8DB6193F9FF486AFA0E6CF86B427B0D231A'
  },
  {
    ...symbolMeta.AXL,
    isNative: true,
    baseDenom: 'uaxl',
    channelId: 'channel-84',
    path: 'transfer/channel-84',
    source: TokenSource.Cosmos,
    hash: 'B68C1D2682A8B69E20BB921E34C6A3A2B6D1E13E3E8C0092E373826F546DEE65'
  },
  {
    ...symbolMeta.SCRT,
    isNative: true,
    baseDenom: 'uscrt',
    channelId: 'channel-88',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-88',
    hash: '0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A'
  },
  {
    ...symbolMeta.XPRT,
    isNative: true,
    baseDenom: 'uxprt',
    channelId: 'channel-82',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-82',
    hash: 'B786E7CBBF026F6F15A8DA248E0F18C62A0F7A70CB2DABD9239398C8B5150ABB'
  },
  {
    ...symbolMeta.EVMOS,
    isNative: true,
    baseDenom: 'aevmos',
    channelId: 'channel-83',
    path: 'transfer/channel-83',
    source: TokenSource.Cosmos,
    hash: '16618B7F7AC551F48C057A13F4CA5503693FBFF507719A85BC6876B8BD75F821'
  },
  {
    ...symbolMeta.DOT,
    baseDenom: 'dot-planck',
    channelId: 'channel-84',
    path: 'transfer/channel-84',
    source: TokenSource.Cosmos,
    hash: '624BA9DD171915A2B9EA70F69638B2CEA179959850C1A586F6C485498F29EDD4'
  },
  {
    ...symbolMeta.STRD,
    isNative: true,
    baseDenom: 'ustrd',
    channelId: 'channel-89',
    path: 'transfer/channel-89',
    source: TokenSource.Cosmos,
    hash: '3FDD002A3A4019B05A33D324B2F29748E77AF501BEA5C96D1F28B2D6755F9F25'
  },
  {
    ...symbolMeta.CRE,
    isNative: true,
    baseDenom: 'ucre',
    channelId: 'channel-90',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-90',
    hash: '3A6DD3358D9F7ADD18CDE79BA10B400511A5DE4AE2C037D7C9639B52ADAF35C6'
  },
  {
    ...symbolMeta.ASTRO,
    isNative: true,
    source: TokenSource.Cosmos,
    channelId: 'channel-104',
    path: 'transfer/channel-104',
    hash: 'EBD5A24C554198EBAF44979C5B4D2C2D312E6EBAB71962C92F735499C7575839',
    baseDenom:
      'cw20:terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26'
  },
  {
    ...symbolMeta.SOMM,
    isNative: true,
    baseDenom: 'usomm',
    channelId: 'channel-93',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-93',
    hash: '34346A60A95EB030D62D6F5BDD4B745BE18E8A693372A8A347D5D53DBBB1328B'
  },
  {
    ...symbolMeta.CANTO,
    isNative: true,
    baseDenom: 'acanto',
    channelId: 'channel-99',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-99',
    hash: 'D91A2C4EE7CD86BBAFCE0FA44A60DDD9AFBB7EEB5B2D46C0984DEBCC6FEDFAE8'
  },
  {
    ...symbolMeta.ARB,
    decimals: 8,
    symbol: 'ARB',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Arbitrum,
    hash: '8CF0E4184CA3105798EDB18CAA3981ADB16A9951FE9B05C6D830C746202747E1',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/4jq5m8FR6W6nJygDj8NMMbB48mqX4LQHc3j5uEb9syDe'
  },
  {
    ...symbolMeta.WMATIC,
    symbol: 'WMATIC',
    decimals: 8,
    channelId: 'channel-183',
    source: TokenSource.Polygon,
    path: 'transfer/channel-183',
    hash: '4DEFEB42BAAB2788723759D95B7550BCE460855563ED977036248F5B94C842FC',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/4gn1J9pchUGh63ez1VwiuTmU4nfJ8Rr8o5HgBC5TMdMk'
  },
  {
    ...symbolMeta.STINJ,
    isNative: true,
    baseDenom: 'stinj',
    channelId: 'channel-89',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-89',
    hash: 'AC87717EA002B0123B10A05063E69BCA274BA2C44D842AEEB41558D2856DCE93'
  },
  {
    ...symbolMeta.KAVA,
    isNative: true,
    baseDenom: 'ukava',
    channelId: 'channel-143',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-143',
    hash: '57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205'
  },
  {
    ...symbolMeta.NEOK,
    isNative: true,
    channelId: 'channel-83',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-83',
    baseDenom: 'erc20/0x655ecB57432CC1370f65e5dc2309588b71b473A9',
    hash: 'F6CC233E5C0EA36B1F74AB1AF98471A2D6A80E2542856639703E908B4D93E7C4'
  },
  {
    ...symbolMeta.ORAI,
    decimals: 6,
    isNative: true,
    baseDenom: 'orai',
    channelId: 'channel-147',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-147',
    hash: 'C20C0A822BD22B2CEF0D067400FCCFB6FAEEE9E91D360B4E0725BD522302D565'
  },
  {
    ...symbolMeta.TIA,
    isNative: true,
    baseDenom: 'utia',
    channelId: 'channel-152',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-152',
    hash: 'F51BB221BAA275F2EBF654F70B005627D7E713AFFD6D86AFD1E43CAA886149F4'
  },
  {
    ...symbolMeta.KUJI,
    isNative: true,
    baseDenom: 'ukuji',
    channelId: 'channel-98',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-98',
    hash: '9A115B56E769B92621FFF90567E2D60EFD146E86E867491DB69EEDA9ADC36204'
  },
  {
    ...symbolMeta.PYTH,
    channelId: 'channel-183',
    source: TokenSource.Solana,
    path: 'transfer/channel-183',
    hash: 'F3330C1B8BD1886FE9509B94C7B5398B892EA41420D2BC0B7C6A53CB8ED761D6',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/B8ohBnfisop27exk2gtNABJyYjLwQA7ogrp5uNzvZCoy'
  },
  {
    ...symbolMeta.ORNE,
    isNative: true,
    channelId: 'channel-116',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-116',
    hash: '3D99439444ACDEE71DBC4A774E49DB74B58846CCE31B9A868A7A61E4C14D321E',
    baseDenom:
      'cw20:terra19p20mfnvwh9yvyr7aus3a6z6g6uk28fv4jhx9kmnc2m7krg27q2qkfenjw'
  },
  {
    ...symbolMeta.DROGO,
    isNative: true,
    channelId: 'channel-118',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-118',
    hash: '565FE65B82C091F8BAD1379FA1B4560C036C07913355ED4BD8D156DA63F43712',
    baseDenom:
      'cw20:terra1cl273523kmr2uwjhhznq54je69mted2u3ljffm8kp2ap4z3drdksftwqun'
  },
  {
    ...symbolMeta.WOSMO,
    isNative: true,
    channelId: 'channel-8',
    path: 'transfer/channel-8',
    source: TokenSource.Cosmos,
    baseDenom: 'factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO',
    hash: 'DD648F5D3CDA56D0D8D8820CF703D246B9FC4007725D8B38D23A21FF1A1477E3'
  },
  {
    ...symbolMeta.ANDR,
    isNative: true,
    baseDenom: 'uandr',
    channelId: 'channel-213',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-213',
    hash: '61FA42C3F0B0F8768ED2CE380EDD3BE0E4CB7E67688F81F70DE9ECF5F8684E1E'
  },
  {
    ...symbolMeta.BMOS,
    isNative: true,
    channelId: 'channel-104',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-104',
    hash: 'D9353C3B1407A7F7FE0A5CCB7D06249B57337888C95C6648AEAF2C83F4F3074E',
    baseDenom:
      'cw20:terra1sxe8u2hjczlekwfkcq0rs28egt38pg3wqzfx4zcrese4fnvzzupsk9gjkq'
  },
  {
    ...symbolMeta.LVN,
    baseDenom: 'ulvn',
    channelId: 'channel-8',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-8',
    hash: '4971C5E4786D5995EC7EF894FCFA9CF2E127E95D5D53A982F6A062F3F410EDB8'
  },
  {
    ...symbolMeta.BONUS,
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Arbitrum,
    hash: 'DCF43489B9438BB7E462F1A1AD38C7898DF7F49649F9CC8FEBFC533A1192F3EF',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/5mejeW9oeeWU7B84t6CSjXskTumVWsapjsbpsivtVZQw'
  },
  {
    ...symbolMeta.W,
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    // source: TokenSource.Wormhole,
    hash: 'F16F0F685BEF7BC6A145F16CBE78C6EC8C7C3A5F3066A98A9E57DCEA0903E537',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2Wb6ueMFc9WLc2eyYVha6qnwHKbwzUXdooXsg6XXVvos'
  },
  {
    ...symbolMeta.CLON,
    isNative: true,
    channelId: 'channel-116',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-116',
    hash: '695B1D16DE4D0FD293E6B79451640974080B59AA60942974C1CC906568DED795',
    baseDenom:
      'cw20:terra164ssz60yvsxey0ku9mtcaegdeyxwzuwwqyrp238nvflwqve0pvxsra7fa2'
  },
  {
    ...symbolMeta.ASG,
    decimals: 8,
    channelId: 'channel-183',
    source: TokenSource.BinanceSmartChain,
    path: 'transfer/channel-183',
    hash: '2D40732D27E22D27A2AB79F077F487F27B6F13DB6293040097A71A52FB8AD021',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/54RgtKyJuM9boEu4G7Dzp2mMrg6w5MuctfU95HoHHeL3'
  },
  {
    ...symbolMeta.SAGA,
    decimals: 6,
    isNative: true,
    baseDenom: 'usaga',
    channelId: 'channel-261',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-261',
    hash: 'AF921F0874131B56897A11AA3F33D5B29CD9C147A1D7C37FE8D918CB420956B2'
  },
  {
    ...symbolMeta.NBZ,
    isNative: true,
    baseDenom:
      'factory/neutron1a6ydq8urdj0gkvjw9e9e5y9r5ce2qegm9m4xufpt96kcm60kmuass0mqq4/nbz',
    channelId: 'channel-177',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-177',
    hash: '1011E4D6D4800DA9B8F21D7C207C0B0C18E54E614A8576037F066B775210709D'
  },
  {
    ...symbolMeta.MOTHER,
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    hash: '984E90A8E0265B9804B7345C7542BF9B3046978AE5557B4AABADDFE605CACABE',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/3yX6ZZbagFp8pLni1gsy9zifaCMYyARGqADqCBwgABgA'
  },
  {
    ...symbolMeta.GME,
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    hash: 'CAA5AB050F6C3DFE878212A37A4A6D3BEA6670F5B9786FFF7EF2D34213025272',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/3nNG5xw6fTXkcQCr36ySsd2jpQR5HgVvrQJtsSaAtiQq'
  },
  {
    ...symbolMeta.PYUSD,
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.EthereumWh,
    hash: '4367FD29E33CDF0487219CD3E88D8C432BD4C2776C0C1034FF05A3E6451B8B11',
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/D2q6uE3gSM7KxBconMFQQxfDenwQYz8JrdXWetkEq9WS'
  },
  {
    ...symbolMeta.FET,
    baseDenom: 'afet',
    channelId: 'channel-283',
    path: 'transfer/channel-283',
    source: TokenSource.Cosmos,
    hash: 'C1D3666F27EA64209584F18BC79648E0C1783BB6EEC04A8060E4A8E9881C841B'
  },
  {
    ...symbolMeta.SNS,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/Dvk1oP4zSe6uWWMbBynzjLaZGtoVD1gNkvnyeGDKZjVq',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    hash: '4BFB3FB1903142C5A7570EE7697636436E52FDB99AB8ABE0257E178A926E2568'
  },
  {
    ...symbolMeta.SAE,
    decimals: 8,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/2mWv5umZHxJ1X8zMeSw3hFPdGuUZmq5UjbCsmJcDdEW1',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.BinanceSmartChain,
    hash: '0AFCFFE18230E0E703A527F7522223D808EBB0E02FDBC84AAF8A045CD8FE0BBB'
  },
  {
    ...untaggedSymbolMeta.Unknown, // adding this deleted denom for injective asset service
    decimals: 6,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/34otzwKo7pCY8YF5wxMrAhjoM9ei7pcEUcMfUBPP2iL7',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    hash: '078184C66B073F0464BA0BBD736DD601A0C637F9C42B592DDA5D6A95289D99A4'
  },
  {
    ...symbolMeta.GIGA,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/Bephz8veqd8byhirRXANbXrxmLAJfn1445n7HKsoPDNJ',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Solana,
    hash: '36C811A2253AA64B58A9B66C537B89348FE5792A8808AAA343082CBFCAA72278'
  },
  {
    ...symbolMeta.USDY,
    baseDenom: 'ausdy',
    isNative: true,
    channelId: 'channel-148',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-148',
    hash: '93EAE5F9D6C14BFAC8DD1AFDBE95501055A7B22C5D8FA8C986C31D6EFADCA8A9'
  },
  {
    ...symbolMeta.BTORO,
    baseDenom:
      'factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/6USkGhBUc4ZYAkeBp65VJsATQL335NyvLZdwaHMicrdj',
    channelId: 'channel-183',
    path: 'transfer/channel-183',
    source: TokenSource.Arbitrum,
    hash: '47245D9854589FADE02554744F387D24E6D7B3D3E7B7DA5596F6C27B8458B7AA'
  },
  {
    ...symbolMeta.OM,
    baseDenom: 'uom',
    channelId: 'channel-363',
    path: 'transfer/channel-363',
    source: TokenSource.Cosmos,
    hash: '775AB5A9D31074F245BB7864B7031AC7BDC9C6C0FD64A72528A8D07203CD71F3'
  },
  {
    ...symbolMeta.XION,
    baseDenom: 'uxion',
    channelId: 'channel-387',
    path: 'transfer/channel-387',
    source: TokenSource.Cosmos,
    hash: '00BF66BAB34873B07FB9EEEBCFACEA11FB4BB348718862AA7782D6DECC1F44C8'
  },
  {
    ...symbolMeta.CHIHUAHUA,
    isNative: true,
    baseDenom:
      'transfer/channel-113/factory/chihuahua1mzcfzh4ufk2cta59pm9a6wdyvv8c4v5epqzj46/Chihuahua',
    channelId: 'channel-8',
    source: TokenSource.Cosmos,
    path: 'transfer/channel-8',
    hash: '422AB9E8C589B6782DA0C3D3BA58FF938B3C26BEB2AE4068535AE82B361D095E'
  },
  {
    ...symbolMeta.LBTC,
    baseDenom: 'uclbtc',
    channelId: 'channel-1340',
    path: 'transfer/channel-1/transfer/channel-1340',
    source: TokenSource.Cosmos,
    hash: 'B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B'
  },
  {
    ...symbolMeta.XRP,
    baseDenom: 'axrp',
    channelId: 'channel-436',
    path: 'transfer/channel-436',
    source: TokenSource.Cosmos,
    hash: 'C3F872E2DF65D066215F3D61364A7D5342784DAB2A5B0441B9B558D692802902'
  }
]
