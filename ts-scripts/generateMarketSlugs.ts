import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetMarketIds as devnetSpotMarketIds,
  stagingMarketIds as stagingSpotMarketIds,
  mainnetMarketIds as mainnetSpotMarketIds,
  testnetMarketIds as testnetSpotMarketIds
} from './data/market/spot'
import {
  devnetMarketIds as devnetDerivativeMarketIds,
  mainnetMarketIds as mainnetDerivativeMarketIds,
  testnetMarketIds as testnetDerivativeMarketIds,
  stagingMarketIds as stagingDerivativeMarketIds
} from './data/market/derivative'
import {
  devnetMarketIds as devnetExpiryFutureMarketIds,
  mainnetMarketIds as mainnetExpiryFutureMarketIds,
  testnetMarketIds as testnetExpiryFutureMarketIds,
  stagingMarketIds as stagingExpiryFutureMarketIds
} from './data/market/expiryFutures'
import {
  devnetGridMarkets as devnetSpotGridMarkets,
  testnetGridMarkets as testnetSpotGridMarkets,
  stagingGridMarkets as stagingSpotGridMarkets,
  mainnetGridMarkets as mainnetSpotGridMarkets
} from './data/grid/spot'
import {
  devnetGridMarkets as devnetDerivativeGridMarkets,
  testnetGridMarkets as testnetDerivativeGridMarkets,
  stagingGridMarkets as stagingDerivativeGridMarkets,
  mainnetGridMarkets as mainnetDerivativeGridMarkets
} from './data/grid/derivative'
import {
  devnetCategoryMap,
  mainnetCategoryMap,
  testnetCategoryMap,
  rwa as rwaCategorySlugs,
  cosmos as cosmosCategorySlugs,
  solana as solanaCategorySlugs,
  ethereum as ethereumCategorySlugs,
  injective as injectiveCategorySlugs,
  newMarkets as newMarketsCategorySlugs,
  olpLowVolume as olpLowVolumeCategorySlugs,
  experimental as experimentalCategorySlugs
} from './data/market/category'
import { filterMarketMapByMarketId } from './helper/market'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

export const generateExpiryFuturesMarketSlugs = async (network: Network) => {
  let marketIds = mainnetExpiryFutureMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingExpiryFutureMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetExpiryFutureMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetExpiryFutureMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/expiry/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).map(({ slug }) => slug)
  )
}

export const generateExpiryFuturesMarketId = async (network: Network) => {
  let marketIds = mainnetExpiryFutureMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingExpiryFutureMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetExpiryFutureMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetExpiryFutureMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/expiryMap/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).reduce(
      (list, { slug, marketId }) => ({ ...list, [slug]: marketId }),
      {}
    )
  )
}

export const generateSpotMarketSlugs = async (network: Network) => {
  let marketIds = mainnetSpotMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingSpotMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetSpotMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetSpotMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/spot/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).map(({ slug }) => slug)
  )
}

export const generateSpotMarketMap = async (network: Network) => {
  let marketIds = mainnetSpotMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingSpotMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetSpotMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetSpotMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/spotMap/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).reduce(
      (list, { slug, marketId }) => ({ ...list, [slug]: marketId }),
      {}
    )
  )
}

export const generateDerivativeMarketSlugs = async (network: Network) => {
  let marketIds = mainnetDerivativeMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingDerivativeMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetDerivativeMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetDerivativeMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/derivative/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).map(({ slug }) => slug)
  )
}

export const generateDerivativeMarketMap = async (network: Network) => {
  let marketIds = mainnetDerivativeMarketIds

  if (network === Network.Staging) {
    marketIds = [...marketIds, ...stagingDerivativeMarketIds]
  }

  if (isDevnet(network)) {
    marketIds = [...marketIds, ...devnetDerivativeMarketIds]
  }

  if (isTestnet(network)) {
    marketIds = [...marketIds, ...testnetDerivativeMarketIds]
  }

  await updateJSONFile(
    `json/helix/trading/derivativeMap/${getNetworkFileName(network)}.json`,
    filterMarketMapByMarketId(marketIds, network).reduce(
      (list, { slug, marketId }) => ({ ...list, [slug]: marketId }),
      {}
    )
  )
}

export const generateSpotGridMarkets = async (network: Network) => {
  let gridMarkets = mainnetSpotGridMarkets

  if (network === Network.Staging) {
    gridMarkets = stagingSpotGridMarkets
  }

  if (isDevnet(network)) {
    gridMarkets = devnetSpotGridMarkets
  }

  if (isTestnet(network)) {
    gridMarkets = testnetSpotGridMarkets
  }

  await updateJSONFile(
    `json/helix/trading/gridMarkets/spot/${getNetworkFileName(network)}.json`,
    gridMarkets
  )
}

export const generateDerivativeGridMarkets = async (network: Network) => {
  let gridMarkets = mainnetDerivativeGridMarkets

  if (network === Network.Staging) {
    gridMarkets = stagingDerivativeGridMarkets
  }

  if (isDevnet(network)) {
    gridMarkets = devnetDerivativeGridMarkets
  }

  if (isTestnet(network)) {
    gridMarkets = testnetDerivativeGridMarkets
  }

  await updateJSONFile(
    `json/helix/trading/gridMarkets/derivative/${getNetworkFileName(
      network
    )}.json`,
    gridMarkets
  )
}

export const generateMarketCategorySlugs = async () => {
  await updateJSONFile('json/helix/trading/market/category.json', {
    rwaCategorySlugs,
    cosmosCategorySlugs,
    solanaCategorySlugs,
    ethereumCategorySlugs,
    injectiveCategorySlugs,
    newMarketsCategorySlugs,
    olpLowVolumeCategorySlugs,
    experimentalCategorySlugs
  })
}

export const generateMarketCategoryMap = async (network: Network) => {
  let categoryMap = mainnetCategoryMap

  if (isDevnet(network)) {
    categoryMap = devnetCategoryMap
  }

  if (isTestnet(network)) {
    categoryMap = testnetCategoryMap
  }

  await updateJSONFile(
    `json/helix/trading/market/categoryMap/${getNetworkFileName(network)}.json`,
    Object.entries(categoryMap).reduce((listMap, [category, marketIds]) => {
      return {
        ...listMap,
        [category]: filterMarketMapByMarketId(marketIds, network)
      }
    }, {})
  )
}

generateSpotMarketSlugs(Network.Devnet)
generateSpotMarketSlugs(Network.Staging)
generateSpotMarketSlugs(Network.TestnetSentry)
generateSpotMarketSlugs(Network.MainnetSentry)

generateExpiryFuturesMarketSlugs(Network.Devnet)
generateExpiryFuturesMarketSlugs(Network.Staging)
generateExpiryFuturesMarketSlugs(Network.TestnetSentry)
generateExpiryFuturesMarketSlugs(Network.MainnetSentry)

generateDerivativeMarketSlugs(Network.Devnet)
generateDerivativeMarketSlugs(Network.Staging)
generateDerivativeMarketSlugs(Network.TestnetSentry)
generateDerivativeMarketSlugs(Network.MainnetSentry)

generateSpotGridMarkets(Network.Devnet)
generateSpotGridMarkets(Network.Staging)
generateSpotGridMarkets(Network.TestnetSentry)
generateSpotGridMarkets(Network.MainnetSentry)

generateDerivativeGridMarkets(Network.Devnet)
generateDerivativeGridMarkets(Network.Staging)
generateDerivativeGridMarkets(Network.TestnetSentry)
generateDerivativeGridMarkets(Network.MainnetSentry)

generateMarketCategorySlugs()

generateExpiryFuturesMarketId(Network.Devnet)
generateExpiryFuturesMarketId(Network.Staging)
generateExpiryFuturesMarketId(Network.TestnetSentry)
generateExpiryFuturesMarketId(Network.MainnetSentry)

generateSpotMarketMap(Network.Devnet)
generateSpotMarketMap(Network.Staging)
generateSpotMarketMap(Network.TestnetSentry)
generateSpotMarketMap(Network.MainnetSentry)

generateDerivativeMarketMap(Network.Devnet)
generateDerivativeMarketMap(Network.Staging)
generateDerivativeMarketMap(Network.TestnetSentry)
generateDerivativeMarketMap(Network.MainnetSentry)

generateMarketCategoryMap(Network.Devnet)
generateMarketCategoryMap(Network.TestnetSentry)
generateMarketCategoryMap(Network.MainnetSentry)
