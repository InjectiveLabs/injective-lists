import { writeFile } from 'node:fs'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import * as externalTokens from '../tokens/externalTokens.json'
import * as devnetStaticTokens from '../tokens/staticTokens/devnet.json'
import * as mainnetStaticTokens from '../tokens/staticTokens/mainnet.json'
import * as testnetStaticTokens from '../tokens/staticTokens/testnet.json'
import * as devnetBankSupplyTokens from '../tokens/bankSupplyTokens/devnet.json'
import * as mainnetBankSupplyTokens from '../tokens/bankSupplyTokens/mainnet.json'
import * as testnetBankSupplyTokens from '../tokens/bankSupplyTokens/testnet.json'
import * as tokenImagePaths from '../tokens/tokenImagePaths.json'
import { getNetworkFileName } from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'

const devnetTokens = [...devnetStaticTokens, ...devnetBankSupplyTokens]
const testnetTokens = [...testnetStaticTokens, ...testnetBankSupplyTokens]
const mainnetTokens = [
  ...mainnetStaticTokens,
  ...mainnetBankSupplyTokens,
  ...externalTokens
]

export const generateTokensList = async (network: Network) => {
  const list = isMainnet(network)
    ? mainnetTokens
    : isTestnet(network)
    ? testnetTokens
    : devnetTokens

  const logos = tokenImagePaths as Record<string, string>

  const formattedList = list.map((token) => {
    return {
      ...token,
      logo: logos[token.logo] || untaggedSymbolMeta.Unknown.logo,
      externalLogo: token.logo
    }
  })

  const data = JSON.stringify(
    formattedList.sort((a, b) => a.denom.localeCompare(b.denom)),
    null,
    2
  )

  writeFile(`./../tokens/${getNetworkFileName(network)}.json`, data, (err) => {
    if (err) {
      console.error(`Error writing tokens ${network}:`, err)
    } else {
      console.log(`✅✅✅ GenerateTokens ${network}`)
    }
  })
}

generateTokensList(Network.Devnet)
generateTokensList(Network.TestnetSentry)
generateTokensList(Network.MainnetSentry)
