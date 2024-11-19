import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetSlugs as devnetSpotSlugs,
  stagingSlugs as stagingSpotSlug,
  mainnetSlugs as mainnetSpotSlugs,
  testnetSlugs as testnetSpotSlugs
} from './data/market/spot'
import {
  devnetDenoms as devnetDenoms,
  mainnetDenoms as mainnetDenoms,
  testnetDenoms as testnetDenoms
} from './data/denoms'
import {
  readJSONFile,
  updateJSONFile,
  tokenToAddressMap,
  getNetworkFileName
} from './helper/utils'
import { getMarketById, filterMarketMapBySlugs } from './helper/market'

const devnetTokensMap = tokenToAddressMap(
  readJSONFile({
    path: 'json/tokens/devnet.json'
  })
)
const testnetTokensMap = tokenToAddressMap(
  readJSONFile({
    path: 'json/tokens/testnet.json'
  })
)
const mainnetTokensMap = tokenToAddressMap(
  readJSONFile({
    path: 'json/tokens/mainnet.json'
  })
)

const getTokenMap = (network: Network) => {
  if (isDevnet(network)) {
    return devnetTokensMap
  }

  if (isTestnet(network)) {
    return testnetTokensMap
  }

  return mainnetTokensMap
}

const getHardcodedDenoms = (network: Network) => {
  const tokenMap = getTokenMap(network)
  let hardcodedDenoms = mainnetDenoms

  if (isDevnet(network)) {
    hardcodedDenoms = devnetDenoms
  }

  if (isTestnet(network)) {
    hardcodedDenoms = testnetDenoms
  }

  return hardcodedDenoms.reduce((list, denom) => {
    const token = tokenMap[denom.replace('peggy', '').toLowerCase()]

    if (!token) {
      return list
    }

    list[denom] = token

    return list
  }, {} as Record<string, any>)
}

const getTradableMarketIds = (network: Network) => {
  let slugs = mainnetSpotSlugs

  if (network === Network.Staging) {
    return [...slugs, ...stagingSpotSlug]
  }

  if (isDevnet(network)) {
    return [...slugs, ...devnetSpotSlugs]
  }

  if (isTestnet(network)) {
    return [...slugs, ...testnetSpotSlugs]
  }

  return filterMarketMapBySlugs(mainnetSpotSlugs, network).map(
    ({ marketId }) => marketId
  )
}

export const generateTradableDenoms = async (network: Network) => {
  const tokenMap = getTokenMap(network)
  const marketIds = getTradableMarketIds(network)

  const verifiedDenoms = marketIds.reduce((list, marketId) => {
    const market = getMarketById(marketId, network)

    if (!market) {
      return list
    }

    return {
      ...list,
      [market.baseDenom]:
        tokenMap[market.baseDenom.replace('peggy', '').toLowerCase()],
      [market.quoteDenom]:
        tokenMap[market.quoteDenom.replace('peggy', '').toLowerCase()]
    }
  }, {} as Record<string, any>)

  const hardcodedDenoms = getHardcodedDenoms(network)

  await updateJSONFile(
    `json/helix/trading/denoms/${getNetworkFileName(network)}.json`,
    { ...verifiedDenoms, ...hardcodedDenoms }
  )
}

generateTradableDenoms(Network.Devnet)
generateTradableDenoms(Network.TestnetSentry)
generateTradableDenoms(Network.MainnetSentry)
