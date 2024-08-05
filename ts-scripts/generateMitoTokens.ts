import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName,
  tokensToDenomMapKeepCasing
} from './helper/utils'
import { getMarketById } from './helper/market'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'

const mainnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'tokens/mito/mainnet.json'
  })
)

const testnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'tokens/mito/testnet.json'
  })
)

const devnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'tokens/mito/devnet.json'
  })
)

const mainnetVaults = readJSONFile({
  path: 'data/mito/mainnet.json'
})

const testnetVaults = readJSONFile({
  path: 'data/mito/testnet.json'
})

const devnetVaults = readJSONFile({
  path: 'data/mito/devnet.json'
})

const getStaticTokensMap = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetStaticTokensMap
  }

  if (isTestnet(network)) {
    return testnetStaticTokensMap
  }

  return devnetStaticTokensMap
}

export const generateMitoTokens = async (network: Network) => {
  let mitoVaults = devnetVaults
  const staticTokensMap = getStaticTokensMap(network)

  if (isTestnet(network)) {
    mitoVaults = testnetVaults
  }

  if (isMainnet(network)) {
    mitoVaults = mainnetVaults
  }

  try {
    const mitoTokens = []

    for (const vault of mitoVaults) {
      const denom = `factory/${vault.masterContractAddress}/lp${vault.contractAddress}`

      if (staticTokensMap[denom]) {
        continue
      }

      const market = getMarketById(vault.marketId, network)

      const mitoToken = {
        ...untaggedSymbolMeta.Unknown,
        decimals: 18,
        denom,
        marketId: [vault.marketId],
        tokenType: TokenType.Lp,
        tokenVerification: TokenVerification.Internal
      }

      if (!market) {
        mitoTokens.push(mitoToken)

        continue
      }

      const formattedTicker = market.ticker
        .replaceAll('/', '-')
        .replaceAll(' ', '-')

      mitoTokens.push({
        ...mitoToken,
        symbol: `MITO-${formattedTicker}`,
        name: `${formattedTicker} LP`
      })
    }

    if (mitoTokens.length === 0) {
      return
    }

    await updateJSONFile(
      `tokens/mito/${getNetworkFileName(network)}.json`,
      mitoTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ generateMitoTokens ${network}`)
  } catch (e) {
    console.log('Error generating mito tokens:', e)
  }
}

generateMitoTokens(Network.Devnet)
generateMitoTokens(Network.TestnetSentry)
generateMitoTokens(Network.MainnetSentry)
