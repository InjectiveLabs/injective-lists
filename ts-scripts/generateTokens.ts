import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'

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

  const logos = readJSONFile({ path: 'tokens/tokenImagePaths.json' }) as Record<
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

  await updateJSONFile(
    `tokens/${getNetworkFileName(network)}.json`,
    formattedList.sort((a, b) => a.denom.localeCompare(b.denom))
  )

  console.log(`✅✅✅ GenerateTokens ${network}`)
}

generateTokensList(Network.Devnet)
generateTokensList(Network.TestnetSentry)
generateTokensList(Network.MainnetSentry)
