import { symbolMeta } from './symbolMeta'
import { TokenFactorySource } from '../../types'

export const devnetTokens: TokenFactorySource[] = [
  {
    ...symbolMeta.KIRA,
    creator: 'inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk'
  }
]

export const testnetTokens: TokenFactorySource[] = [
  {
    ...symbolMeta.TIX,
    creator: 'inj1rw3qvamxgmvyexuz2uhyfa4hukvtvteznxjvke'
  },
  {
    ...symbolMeta.wBTC,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.ATOM,
    decimals: 8,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.wEth,
    decimals: 8,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.USDC,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.MATIC,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.stINJ,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.KIRA,
    creator: 'inj1jfuyujpvvkxq4566r3z3tv3jdy29pqra5ln0yk'
  },
  {
    ...symbolMeta.ZEN,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.PROJ,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.PROJX,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.DEMO,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.MITOTEST2,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.TEST1,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.TEST2,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.TEST3,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.PHUC,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.TIA,
    creator: 'inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c'
  },
  {
    ...symbolMeta.NLT2,
    creator: 'inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z'
  },
  {
    ...symbolMeta.TRD,
    creator: 'inj1pq04wwv22cchwfggwvcj3xq45yse0ln8v3qxtj'
  },
  {
    ...symbolMeta.TALIS,
    creator: 'inj1maeyvxfamtn8lfyxpjca8kuvauuf2qeu6gtxm3',
    subdenom: 'Talis-3'
  }
]

export const mainnetTokens: TokenFactorySource[] = [
  {
    ...symbolMeta.POINT,
    creator: 'inj1zaem9jqplp08hkkd5vcl6vmvala9qury79vfj4'
  },
  {
    ...symbolMeta.NBLA,
    creator: 'inj1d0zfq42409a5mhdagjutl8u6u9rgcm4h8zfmfq'
  },
  {
    ...symbolMeta.TALIS,
    creator: 'inj1maeyvxfamtn8lfyxpjca8kuvauuf2qeu6gtxm3'
  },
  {
    ...symbolMeta.XTALIS,
    creator: 'inj1maeyvxfamtn8lfyxpjca8kuvauuf2qeu6gtxm3'
  },
  {
    ...symbolMeta.KIRA,
    creator: 'inj1xy3kvlr4q4wdd6lrelsrw2fk2ged0any44hhwq'
  },
  {
    ...symbolMeta.BlackINJ,
    creator: 'inj10q36ygr0pkz7ezajcnjd2f0tat5n737yg6g6d5'
  },
  {
    ...symbolMeta.BirdINJ,
    creator: 'inj125hcdvz9dnhdqal2u8ctr7l0hd8xy9wdgzt8ld'
  },
  {
    ...symbolMeta.BirdINJ,
    creator: 'inj1lhr06p7k3rdgk0knw5hfsde3fj87g2aq4e9a52'
  },
  {
    ...symbolMeta.NINJA,
    creator: 'inj1xtel2knkt8hmc9dnzpjz6kdmacgcfmlv5f308w'
  },
  {
    ...symbolMeta.KATANA,
    creator: 'inj1vwn4x08hlactxj3y3kuqddafs2hhqzapruwt87'
  },
  {
    ...symbolMeta.GALAXY,
    creator: 'inj10zdjt8ylfln5xr3a2ruf9nwn6d5q2d2r3v6mh8'
  },
  {
    ...symbolMeta.AOI,
    creator: 'inj169ed97mcnf8ay6rgvskn95n6tyt46uwvy5qgs0'
  },
  {
    ...symbolMeta.NOBI,
    creator: 'inj1pjp9q2ycs7eaav8d5ny5956k5m6t0alpl33xd6'
  },
  {
    ...symbolMeta.NOBI,
    creator: 'inj1t02au5gsk40ev9jaq0ggcyry9deuvvza6s4wav'
  },
  {
    ...symbolMeta.NOBI,
    creator: 'inj1xawhm3d8lf9n0rqdljpal033yackja3dt0kvp0'
  },
  {
    ...symbolMeta.YUKI,
    creator: 'inj1spdy83ds5ezq9rvtg0ndy8480ad5rlczcpvtu2'
  },
  {
    ...symbolMeta.WAGMI,
    creator: 'inj188veuqed0dygkcmq5d24u3807n6csv4wdv28gh'
  },
  {
    ...symbolMeta.BAMBOO,
    creator: 'inj144nw6ny28mlwuvhfnh7sv4fcmuxnpjx4pksr0j'
  },
  {
    ...symbolMeta.BAMBOO,
    creator: 'inj183lz632dna57ayuf6unqph5d0v2u655h2jzzyy'
  },
  {
    ...symbolMeta.SHURIKEN,
    creator: 'inj1z426atp9k68uv49kaam7m0vnehw5fulxkyvde0'
  },
  {
    ...symbolMeta.SHURIKEN,
    creator: 'inj1kt6ujkzdfv9we6t3ca344d3wquynrq6dg77qju'
  },
  {
    ...symbolMeta.SHURIKEN,
    creator: 'inj1gflhshg8yrk8rrr3sgswhmsnygw9ghzdsn05a0'
  },
  {
    ...symbolMeta.BRETT,
    creator: 'inj13jjdsa953w03dvecsr43dj5r6a2vzt7n0spncv'
  },
  {
    ...symbolMeta.DOJ,
    creator: 'inj172ccd0gddgz203e4pf86ype7zjx573tn8g0df9'
  },
  {
    ...symbolMeta.GINGER,
    creator: 'inj172ccd0gddgz203e4pf86ype7zjx573tn8g0df9'
  },
  {
    ...symbolMeta.ERIC,
    creator: 'inj1w7cw5tltax6dx7znehul98gel6yutwuvh44j77'
  },
  {
    ...symbolMeta.INJINU,
    creator: 'inj1vjppa6h9lf75pt0v6qnxtej4xcl0qevnxzcrvm'
  },
  {
    ...symbolMeta.Babykira,
    creator: 'inj13vau2mgx6mg7ams9nngjhyng58tl9zyw0n8s93'
  },
  {
    ...symbolMeta.Babykira,
    creator: 'inj15jeczm4mqwtc9lk4c0cyynndud32mqd4m9xnmu'
  },
  {
    ...symbolMeta.LIOR,
    creator: 'inj1cjus5ragdkvpmt627fw7wkj2ydsra9s0vap4zx'
  },
  {
    ...symbolMeta.LIOR,
    creator: 'inj1sg3yjgjlwhtrepeuusj4jwv209rh6cmk882cw3'
  },
  {
    ...symbolMeta.LIOR,
    creator: 'inj1tgphgjqsz8fupkfjx6cy275e3s0l8xfu6rd6jh'
  },
  {
    ...symbolMeta.INJER,
    creator: 'inj1sjmplasxl9zgj6yh45j3ndskgdhcfcss9djkdn'
  },
  {
    ...symbolMeta.SHIBA,
    creator: 'inj1v0yk4msqsff7e9zf8ktxykfhz2hen6t2u4ue4r'
  },
  {
    ...symbolMeta.GROK,
    creator: 'inj1vgrf5mcvvg9p5c6jajqefn840nq74wjzgkt30z'
  },
  {
    ...symbolMeta.SNOWY,
    creator: 'inj1ml33x7lkxk6x2x95d3alw4h84evlcdz2gnehmk'
  },
  {
    ...symbolMeta.BULLS,
    creator: 'inj1zq37mfquqgud2uqemqdkyv36gdstkxl27pj5e3'
  },
  {
    ...symbolMeta.KINJA,
    creator: 'inj1h33jkaqqalcy3wf8um6ewk4hxmfwf8uern470k'
  },
  {
    ...symbolMeta.LAMA,
    creator: 'inj18lh8zx4hx0pyksyu74srktv4vgxskkkafknggl'
  },
  {
    ...symbolMeta.INJEX,
    creator: 'inj1zhevrrwywg3az9ulxd9u233eyy4m2mmr6vegsg'
  },
  {
    ...symbolMeta.NINJB,
    creator: 'inj1ezzzfm2exjz57hxuc65sl8s3d5y6ee0kxvu67n'
  },
  {
    ...symbolMeta.KARATE,
    creator: 'inj1898t0vtmul3tcn3t0v8qe3pat47ca937jkpezv'
  },
  {
    ...symbolMeta.NPEPE,
    creator: 'inj1ga982yy0wumrlt4nnj79wcgmw7mzvw6jcyecl0'
  },
  {
    ...symbolMeta.MILK,
    creator: 'inj1fpl63h7at2epr55yn5svmqkq4fkye32vmxq8ry'
  },
  {
    ...symbolMeta.MILK,
    creator: 'inj1yg24mn8enl5e6v4jl2j6cce47mx4vyd6e8dpck'
  },
  {
    ...symbolMeta.INCEL,
    creator: 'inj17g4j3geupy762u0wrewqwprvtzar7k5et2zqsh'
  },
  {
    ...symbolMeta.PIKACHU,
    creator: 'inj1h9zu2u6yqf3t5uym75z94zsqfhazzkyg39957u'
  },
  {
    ...symbolMeta.PIKACHU,
    creator: 'inj1h4usvhhva6dgmun9rk4haeh8lynln7yhk6ym00'
  },
  {
    ...symbolMeta.WGMI,
    creator: 'inj1rmjzj9fn47kdmfk4f3z39qr6czexxe0yjyc546'
  },
  {
    ...symbolMeta.WIZZ,
    creator: 'inj1uvfpvnmuqhx8jwg4786y59tkagmph827h38mst'
  },
  {
    ...symbolMeta.DUDE,
    creator: 'inj1sn34edy635nv4yhts3khgpy5qxw8uey6wvzq53'
  },
  {
    ...symbolMeta.AUTISM,
    creator: 'inj14lf8xm6fcvlggpa7guxzjqwjmtr24gnvf56hvz'
  },
  {
    ...symbolMeta.EXTRAVIRGINOLIVEINU,
    creator: 'inj14n8f39qdg6t68s5z00t4vczvkcvzlgm6ea5vk5'
  },
  {
    ...symbolMeta.MILA,
    creator: 'inj1z08usf75ecfp3cqtwey6gx7nr79s3agal3k8xf'
  },
  {
    ...symbolMeta.IPDAI,
    creator: 'inj1y3g4wpgnc4s28gd9ure3vwm9cmvmdphml6mtul'
  },
  {
    ...symbolMeta.COCK,
    creator: 'inj1eucxlpy6c387g5wrn4ee7ppshdzg3rh4t50ahf'
  },
  {
    ...symbolMeta.MOONIFY,
    creator: 'inj1ktq0gf7altpsf0l2qzql4sfs0vc0ru75cnj3a6'
  },
  {
    ...symbolMeta.KARMAINJ,
    creator: 'inj1d4ld9w7mf8wjyv5y7fnhpate07fguv3s3tmngm'
  },
  {
    ...symbolMeta.DREAM,
    creator: 'inj1l2kcs4yxsxe0c87qy4ejmvkgegvjf0hkyhqk59'
  },
  {
    ...symbolMeta.DGNZ,
    creator: 'inj1l2kcs4yxsxe0c87qy4ejmvkgegvjf0hkyhqk59'
  },
  {
    ...symbolMeta.INJECT,
    creator: 'inj1j7zt6g03vpmg9p7g7qngvylfxqeuds73utsjnk'
  },
  {
    ...symbolMeta.WAIFU,
    creator: 'inj12dvzf9tx2ndc9498aqpkrxgugr3suysqwlmn49'
  },
  {
    ...symbolMeta.DOJOBot,
    creator: 'inj1any4rpwq7r850u6feajg5payvhwpunu9cxqevc'
  },
  {
    ...symbolMeta.PUNKDAO,
    creator: 'inj1esz96ru3guug4ctmn5chjmkymt979sfvufq0hs'
  },
  {
    ...symbolMeta.RAMEN,
    creator: 'inj1z5utcc5u90n8a5m8gv30char6j4hdzxz6t3pke'
  },
  {
    ...symbolMeta.ALIEN,
    creator: 'inj1mly2ykhf6f9tdj58pvndjf4q8dzdl4myjqm9t6'
  },
  {
    ...symbolMeta.RICE,
    creator: 'inj1mt876zny9j6xae25h7hl7zuqf7gkx8q63k0426'
  },
  {
    ...symbolMeta.BITS,
    creator: 'inj10gcvfpnn4932kzk56h5kp77mrfdqas8z63qr7n'
  },
  {
    ...symbolMeta.IKINGS,
    creator: 'inj1mt876zny9j6xae25h7hl7zuqf7gkx8q63k0426'
  },
  {
    ...symbolMeta.QUNT,
    creator: 'inj127l5a2wmkyvucxdlupqyac3y0v6wqfhq03ka64'
  },
  {
    ...symbolMeta.HDRO,
    creator: 'inj1pk7jhvjj2lufcghmvr7gl49dzwkk3xj0uqkwfk'
  },
  {
    ...symbolMeta.HDRO,
    creator: 'inj1etz0laas6h7vemg3qtd67jpr6lh8v7xz7gfzqw'
  },
  {
    ...symbolMeta.INJX,
    creator: 'inj104h3hchl7ws8lp78zpvrunvsjdwfjc02r5d0fp'
  },
  {
    ...symbolMeta.BLACK,
    creator: 'inj16eckaf75gcu9uxdglyvmh63k9t0l7chd0qmu85'
  },
  {
    ...symbolMeta.PHUC,
    creator: 'inj1995xnrrtnmtdgjmx0g937vf28dwefhkhy6gy5e'
  },
  {
    ...symbolMeta.BONJO,
    decimals: 6,
    creator: 'inj1r35twz3smeeycsn4ugnd3w0l5h2lxe44ptuu4w'
  },
  {
    ...symbolMeta.SAE,
    creator: 'inj152mdu38fkkk4fl7ycrpdqxpm63w3ztadgtktyr'
  },
  {
    ...symbolMeta.XIII,
    creator: 'inj18flmwwaxxqj8m8l5zl8xhjrnah98fcjp3gcy3e'
  },
  {
    ...symbolMeta.DDL,
    creator: 'inj1put8lfpkwm47tqcl9fgh8grz987mezvrx4arls'
  },
  {
    ...symbolMeta.SPUUN,
    creator: 'inj1flkktfvf8nxvk300f2z3vxglpllpw59c563pk7'
  },
  {
    ...symbolMeta.GOLDIE,
    creator: 'inj130ayayz6ls8qpmu699axhlg7ygy8u6thjjk9nc'
  },
  {
    ...symbolMeta.COKE,
    creator: 'inj158g7dfclyg9rr6u4ddxg9d2afwevq5d79g2tm6'
  },
  {
    ...symbolMeta.SMELLY,
    creator: 'inj10pz3xq7zf8xudqxaqealgyrnfk66u3c99ud5m2'
  },
  {
    ...symbolMeta.NBZAIRDROP,
    creator: 'inj1llr45x92t7jrqtxvc02gpkcqhqr82dvyzkr4mz'
  },
  {
    ...symbolMeta.NBZLOOTBOX1,
    creator: 'inj1llr45x92t7jrqtxvc02gpkcqhqr82dvyzkr4mz'
  },
  {
    ...symbolMeta.backboneInj,
    creator: 'inj1dxp690rd86xltejgfq2fa7f2nxtgmm5cer3hvu'
  },
  {
    ...symbolMeta.syndicate,
    creator: 'inj1a6xdezq7a94qwamec6n6cnup02nvewvjtz6h6e'
  },
  {
    ...symbolMeta.PAIN,
    creator: 'inj1u6j86hy6a2z0ksuhuh54x6kh532e7esdfjd2k7'
  },
  {
    ...symbolMeta.DRUGS_cw20,
    creator: 'inj1dh8cm0j4nftd78slh9gzvmwg68366luxe46mqa'
  },
  {
    ...symbolMeta.DRUGS,
    creator: 'inj178zy7myyxewek7ka7v9hru8ycpvfnen6xeps89'
  },
  {
    ...symbolMeta.AGENT,
    creator: 'inj16dd5xzszud3u5wqphr3tq8eaz00gjdn3d4mvj8'
  },
  {
    ...symbolMeta.SAI,
    creator: 'inj10aa0h5s0xwzv95a8pjhwluxcm5feeqygdk3lkm'
  },
  {
    ...symbolMeta.MANGO,
    creator: 'inj17cfaytu2lg9zcdxdz8hx9jxkm9jcnxh58fc3ww'
  },
  {
    ...symbolMeta.NEPT,
    creator: 'inj1v3a4zznudwpukpr8y987pu5gnh4xuf7v36jhva'
  },
  {
    ...symbolMeta.AUSD,
    creator: 'inj1n636d9gzrqggdk66n2f97th0x8yuhfrtx520e7'
  },
  {
    ...symbolMeta.NBZ,
    creator: 'inj1llr45x92t7jrqtxvc02gpkcqhqr82dvyzkr4mz'
  },
  {
    ...symbolMeta.BILLS,
    creator: 'inj1y68qhgmkca9szmxwl2j7y83wyl4prm7vru5vtf'
  },
  {
    ...symbolMeta.JNI,
    creator: 'inj1fefpnm6pklz3av6zzjmr5z070779a9m4sx384v'
  },
  {
    ...symbolMeta.ARST,
    creator: 'inj1aegme2dcy3dvk0v22wxdgd9609shyy2pgyh2kk'
  },
  {
    ...symbolMeta.TruINJ,
    creator: 'inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk'
  },
  {
    ...symbolMeta.PUGGOCTO,
    creator: 'inj1nw35hnkz5j74kyrfq9ejlh2u4f7y7gt7c3ckde'
  },
  {
    ...symbolMeta.LBC,
    creator: 'inj1rc7u60e0gz9x8ukwwqr7d6dh984ysqrpk2qvlv'
  },
  {
    ...symbolMeta.TIX,
    creator: 'inj1khttezjv9x6dpadysffpf7m00rch2ldhezz7s2'
  },
  {
    ...symbolMeta.dATOM_nATOM_LP,
    creator: 'inj18ucwme9nyemev9cjhy6jtagtu4laxh7ztzeqqc'
  },
  {
    ...symbolMeta.USDC_nUSDC_LP,
    creator: 'inj1802zllqw882e965hnmc7f0rrffkfjg0mj2l4c4'
  },
  {
    ...symbolMeta.nUSDC_NEPT_LP,
    creator: 'inj1qzwm4gqpj9rehxl8dd7cqjfr9hk63urcmwran0'
  },
  {
    ...symbolMeta.nUSDC_nUSDT_LP,
    creator: 'inj1nnddrrcetnqvvf4agxdve08jm6zjfhpcgu9ltq'
  },
  {
    ...symbolMeta.USDT_nUSDT_LP,
    creator: 'inj1l4258ut9zjuvfvrzjungqq038cclksrm2hnhat'
  },
  {
    ...symbolMeta.nUSDT_NEPT_LP,
    creator: 'inj1lv24hws4anfmeh850msfpvgtxpc7tt24vymxx8'
  },
  {
    ...symbolMeta.nINJ_nUSDT_LP,
    creator: 'inj1zgjnaenn3vzs9dqz49l5hfeqvpv38cljdk52m9'
  },
  {
    ...symbolMeta.nINJ_NEPT_LP,
    creator: 'inj1nga8pt2tywk4535hzy9upylfn7kxm9cuytqt50'
  },
  {
    ...symbolMeta.INJ_nINJ_LP,
    creator: 'inj1322fsvvsp785lv2un8gwk8qkysqmn4xehu52uu'
  },
  {
    ...symbolMeta.nATOM_ATOM_LP,
    creator: 'inj15c5gy2l2zdtumxhyjrfq72y2cq5d5u4t7lp6xp'
  },
  {
    ...symbolMeta.nATOM_NEPT_LP,
    creator: 'inj12yekr4xjww5ugvme3cgneeu5awuljvlh8rh57q'
  },
  {
    ...symbolMeta.OYCI,
    creator: 'inj1jdt04erw6jdmh6c939u87kldf3mvvmkedsjp3w'
  },
  {
    ...symbolMeta.TWT2,
    creator: 'inj13we6l25kpzws8nlw0rnd30zejgcgq078fn4fag'
  },
  {
     ...symbolMeta.HPNJ,
    creator: 'inj1ng84mfnq4z4tuh0cd7a28x0hxw75vxcm70ls9q'
  }
]
