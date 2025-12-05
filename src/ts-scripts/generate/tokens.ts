import { TokenVerification } from '@injectivelabs/sdk-ts'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../helper/utils'
import { untaggedSymbolMeta } from '../../data/tokens/untaggedSymbolMeta'
import { Token } from '../../types'

const devnetSupplyDenoms = readJSONFile({
  path: 'src/cache/bankSupplyDenoms/devnet.json'
})

const devnetTokens = [
  ...readJSONFile({ path: 'src/generated/tokens/staticTokens/devnet.json' }),
  ...readJSONFile({
    path: 'src/generated/tokens/bankSupplyTokens/devnet.json'
  }),
  ...readJSONFile({ path: 'src/generated/tokens/cw20Tokens/devnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/factoryTokens/devnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/mito/devnet.json' })
]
const testnetTokens = [
  ...readJSONFile({ path: 'src/generated/tokens/staticTokens/testnet.json' }),
  ...readJSONFile({
    path: 'src/generated/tokens/bankSupplyTokens/testnet.json'
  }),
  ...readJSONFile({ path: 'src/generated/tokens/cw20Tokens/testnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/factoryTokens/testnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/mito/testnet.json' })
]
const mainnetTokens = [
  ...readJSONFile({ path: 'src/generated/tokens/staticTokens/mainnet.json' }),
  ...readJSONFile({
    path: 'src/generated/tokens/bankSupplyTokens/mainnet.json'
  }),
  ...readJSONFile({ path: 'src/generated/tokens/mito/mainnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/externalTokens.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/cw20Tokens/mainnet.json' }),
  ...readJSONFile({ path: 'src/generated/tokens/factoryTokens/mainnet.json' })
]

// filter out tokens that are not in the supply to optimize coinGecko API calls on devnet indexer
const devnetFilteredTokens = devnetTokens.filter((token) => {
  return devnetSupplyDenoms.includes(token.denom)
})

export const generateTokensList = async (network: Network) => {
  const list = isMainnet(network)
    ? mainnetTokens
    : isTestnet(network)
    ? testnetTokens
    : devnetFilteredTokens

  const logos = readJSONFile({
    path: 'src/data/tokenImagePaths.json'
  }) as Record<string, string>

  const formattedList = list.map((token) => {
    return {
      ...token,
      // todo: use external logo if it looks ok on the UI
      logo: logos[token.logo] || logos[untaggedSymbolMeta.Unknown.logo],
      externalLogo: token.externalLogo || token.logo
    }
  })

  const verificationOrderMap = new Map([
    [TokenVerification.Verified, 0],
    [TokenVerification.Internal, 1],
    [TokenVerification.External, 2],
    [TokenVerification.Submitted, 3],
    [TokenVerification.Unverified, 4]
  ])

  const uniqueTokensMap = new Map<string, Token>()

  for (const token of formattedList) {
    const denom = token.denom
    const cachedToken = uniqueTokensMap.get(denom)

    if (cachedToken) {
      const tokenOrder =
        verificationOrderMap.get(
          token.tokenVerification as TokenVerification
        ) ?? 4
      const existingOrder =
        verificationOrderMap.get(
          cachedToken.tokenVerification as TokenVerification
        ) ?? 4

      if (
        tokenOrder < existingOrder ||
        (cachedToken.decimals === 0 && token.decimals > 0)
      ) {
        console.log(`Replacing duplicate: ${denom}`)
        console.log(
          `   OLD: ${cachedToken.symbol} (${cachedToken.tokenVerification}) - ${cachedToken.decimals} decimals`
        )
        console.log(
          `   NEW: ${token.symbol} (${token.tokenVerification}) - ${token.decimals} decimals`
        )
        console.log('')

        uniqueTokensMap.set(denom, token)
      }
    } else {
      uniqueTokensMap.set(denom, token)
    }
  }

  const sortedList = Array.from(uniqueTokensMap.values()).sort(
    (t1: Token, t2: Token) => {
      const t1VerificationOrder =
        verificationOrderMap.get(t1.tokenVerification as TokenVerification) ?? 4
      const t2VerificationOrder =
        verificationOrderMap.get(t2.tokenVerification as TokenVerification) ?? 4

      if (t1VerificationOrder === t2VerificationOrder) {
        return t1.denom.localeCompare(t2.denom)
      }

      return t1VerificationOrder - t2VerificationOrder
    }
  )

  console.log(`Uploaded ${network} with ${sortedList.length} tokens`)

  await updateJSONFile(
    `json/tokens/${getNetworkFileName(network)}.json`,
    sortedList
  )

  // backward compatibility for sdk-go users
  await updateJSONFile(`tokens/${getNetworkFileName(network)}.json`, sortedList)

  console.log(`✅✅✅ GenerateTokens ${network}`)
}

console.time('generateTokensList Devnet')
generateTokensList(Network.Devnet)
console.timeEnd('generateTokensList Devnet')

console.time('generateTokensList TestnetSentry')
generateTokensList(Network.TestnetSentry)
console.timeEnd('generateTokensList TestnetSentry')

console.time('generateTokensList MainnetSentry')
generateTokensList(Network.MainnetSentry)
console.timeEnd('generateTokensList MainnetSentry')
