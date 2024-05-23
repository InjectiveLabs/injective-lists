import { TokenVerification } from '@injectivelabs/token-metadata'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { Token } from './types'

const devnetTokens = [
  ...readJSONFile({ path: 'tokens/staticTokens/devnet.json' }),
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/devnet.json' })
]
const testnetTokens = [
  ...readJSONFile({ path: 'tokens/staticTokens/testnet.json' }),
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/testnet.json' })
]
const mainnetTokens = [
  ...readJSONFile({ path: 'tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/externalTokens.json' })
]

export const generateTokensList = async (network: Network) => {
  const list = isMainnet(network)
    ? mainnetTokens
    : isTestnet(network)
    ? testnetTokens
    : devnetTokens

  const logos = readJSONFile({ path: 'data/tokenImagePaths.json' }) as Record<
    string,
    string
  >

  const formattedList = list.map((token) => {
    return {
      ...token,
      logo: logos[token.logo] || logos[untaggedSymbolMeta.Unknown.logo],
      externalLogo: token.logo
    }
  })

  const tokenVerificationSortingOrder = [
    TokenVerification.Verified,
    TokenVerification.Internal,
    TokenVerification.External,
    TokenVerification.Submitted,
    TokenVerification.Unverified
  ]

  const sortedList = formattedList.sort((t1: Token, t2: Token) => {
    const t1VerificationOrder = tokenVerificationSortingOrder.indexOf(
      t1.tokenVerification as TokenVerification
    )
    const t2VerificationOrder = tokenVerificationSortingOrder.indexOf(
      t2.tokenVerification as TokenVerification
    )

    if (t1VerificationOrder === t2VerificationOrder) {
      return t1.denom.localeCompare(t2.denom)
    }

    return t1VerificationOrder - t2VerificationOrder
  })

  await updateJSONFile(`tokens/${getNetworkFileName(network)}.json`, sortedList)

  console.log(`✅✅✅ GenerateTokens ${network}`)
}

generateTokensList(Network.Devnet)
generateTokensList(Network.TestnetSentry)
generateTokensList(Network.MainnetSentry)
