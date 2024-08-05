import { TokenVerification } from '@injectivelabs/sdk-ts'
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
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/devnet.json' }),
  ...readJSONFile({ path: 'tokens/cw20Tokens/devnet.json' }),
  ...readJSONFile({ path: 'tokens/factoryTokens/devnet.json' }),
  ...readJSONFile({ path: 'tokens/mito/devnet.json' })
]
const testnetTokens = [
  ...readJSONFile({ path: 'tokens/staticTokens/testnet.json' }),
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/testnet.json' }),
  ...readJSONFile({ path: 'tokens/cw20Tokens/testnet.json' }),
  ...readJSONFile({ path: 'tokens/factoryTokens/testnet.json' }),
  ...readJSONFile({ path: 'tokens/mito/testnet.json' })
]
const mainnetTokens = [
  ...readJSONFile({ path: 'tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/bankSupplyTokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/mito/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/externalTokens.json' }),
  ...readJSONFile({ path: 'tokens/cw20Tokens/mainnet.json' }),
  ...readJSONFile({ path: 'tokens/factoryTokens/mainnet.json' })
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

  const overwrittenTokens: any[] = []

  const uniqueTokens = formattedList.reduce((list, token: Token) => {
    const denom = token.denom

    if (list[denom]) {
      const cachedToken = list[denom]

      const tokenSortingOrder = tokenVerificationSortingOrder.indexOf(
        token.tokenVerification as TokenVerification
      )
      const cachedTokenSortingOrder = tokenVerificationSortingOrder.indexOf(
        cachedToken.tokenVerification as TokenVerification
      )

      if (
        tokenSortingOrder > cachedTokenSortingOrder ||
        cachedToken.decimals === 0
      ) {
        overwrittenTokens.push({
          cachedToken: cachedToken,
          token,
          tokenSortingOrder,
          cachedTokenSortingOrder,
          conditionA: tokenSortingOrder > cachedTokenSortingOrder,
          conditionB: cachedToken.decimals === 0
        })

        console.log(`===== replace duplicate ${denom} ======`)
        console.log(cachedToken)
        console.log(`===== with ======`)
        console.log(token)

        list[denom] = token
      }

      return list
    }

    return { ...list, [denom]: token }
  }, {})

  console.log(
    JSON.stringify({ overwrittenTokens: overwrittenTokens.splice(0, 10) })
  )

  const sortedList = (Object.values(uniqueTokens) as Token[]).sort(
    (t1: Token, t2: Token) => {
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
    }
  )

  console.log(`Uploaded ${network} with ${sortedList.length} tokens`)

  await updateJSONFile(`tokens/${getNetworkFileName(network)}.json`, sortedList)

  console.log(`✅✅✅ GenerateTokens ${network}`)
}

// generateTokensList(Network.Devnet)
// generateTokensList(Network.TestnetSentry)
generateTokensList(Network.MainnetSentry)
