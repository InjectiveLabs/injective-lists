import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetSlugs as devnetSpotSlugs,
  mainnetSlugs as mainnetSpotSlugs,
  testnetSlugs as testnetSpotSlugs,
  stagingSlugs as stagingSpotSlug
} from './data/market/spot'
import {
  devnetSlugs as devnetDerivativeSlugs,
  mainnetSlugs as mainnetDerivativeSlugs,
  testnetSlugs as testnetDerivativeSlugs,
  stagingSlugs as stagingDerivativeSlugs
} from './data/market/derivative'
import {
  devnetSlugs as devnetExpiryFutureSlugs,
  mainnetSlugs as mainnetExpiryFutureSlugs,
  testnetSlugs as testnetExpiryFutureSlugs,
  stagingSlugs as stagingExpiryFutureSlugs
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
  rwa as rwaCategorySlugs,
  cosmos as cosmosCategorySlugs,
  solana as solanaCategorySlugs,
  ethereum as ethereumCategorySlugs,
  injective as injectiveCategorySlugs,
  newMarkets as newMarketsCategorySlugs,
  olpLowVolume as olpLowVolumeCategorySlugs,
  experimental as experimentalCategorySlugs
} from './data/market/category'
import { filterMarketMapBySlugs } from './helper/market'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

export const generateExpiryFuturesMarketSlugs = async (network: Network) => {
  let slugs = mainnetExpiryFutureSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingExpiryFutureSlugs]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetExpiryFutureSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetExpiryFutureSlugs]
  }

  await updateJSONFile(
    `json/helix/trading/expiry/${getNetworkFileName(network)}.json`,
    slugs
  )
}

export const generateExpiryFuturesMarketId = async (network: Network) => {
  let slugs = mainnetExpiryFutureSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingExpiryFutureSlugs]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetExpiryFutureSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetExpiryFutureSlugs]
  }

  await updateJSONFile(
    `json/helix/trading/expiryMap/${getNetworkFileName(network)}.json`,
    filterMarketMapBySlugs(slugs, network)
  )
}

export const generateSpotMarketSlugs = async (network: Network) => {
  let slugs = mainnetSpotSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingSpotSlug]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetSpotSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetSpotSlugs]
  }

  await updateJSONFile(
    `json/helix/trading/spot/${getNetworkFileName(network)}.json`,
    slugs
  )
}

export const generateSpotMarketMap = async (network: Network) => {
  let slugs = mainnetSpotSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingSpotSlug]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetSpotSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetSpotSlugs]
  }

  const spotMarketMap = filterMarketMapBySlugs(slugs, network).reduce(
    (list, { slug, marketId }) => {
      return { ...list, [slug]: marketId }
    },
    {}
  )

  await updateJSONFile(
    `json/helix/trading/spotMap/${getNetworkFileName(network)}.json`,
    spotMarketMap
  )
}

export const generateDerivativeMarketSlugs = async (network: Network) => {
  let slugs = mainnetDerivativeSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingDerivativeSlugs]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetDerivativeSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetDerivativeSlugs]
  }

  await updateJSONFile(
    `json/helix/trading/derivative/${getNetworkFileName(network)}.json`,
    slugs
  )
}

export const generateDerivativeMarketMap = async (network: Network) => {
  let slugs = mainnetDerivativeSlugs

  if (network === Network.Staging) {
    slugs = [...slugs, ...stagingDerivativeSlugs]
  }

  if (isDevnet(network)) {
    slugs = [...slugs, ...devnetDerivativeSlugs]
  }

  if (isTestnet(network)) {
    slugs = [...slugs, ...testnetDerivativeSlugs]
  }

  const derivativeMarketMap = filterMarketMapBySlugs(slugs, network).reduce(
    (list, { slug, marketId }) => {
      return { ...list, [slug]: marketId }
    },
    {}
  )

  await updateJSONFile(
    `json/helix/trading/derivativeMap/${getNetworkFileName(network)}.json`,
    derivativeMarketMap
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
  const list = Object.entries({
    rwaCategoryMap: rwaCategorySlugs,
    cosmosCategoryMap: cosmosCategorySlugs,
    solanaCategoryMap: solanaCategorySlugs,
    ethereumCategoryMap: ethereumCategorySlugs,
    injectiveCategoryMap: injectiveCategorySlugs,
    newMarketsCategoryMap: newMarketsCategorySlugs,
    olpLowVolumeCategoryMap: olpLowVolumeCategorySlugs,
    experimentalCategoryMap: experimentalCategorySlugs
  }).reduce((list, [key, slugs]) => {
    const categoryMap = filterMarketMapBySlugs(slugs, network).reduce(
      (list, { slug, marketId }) => {
        return { ...list, [marketId]: slug }
      },
      {}
    )

    return { ...list, [key]: categoryMap }
  }, {})

  await updateJSONFile(
    `json/helix/trading/market/categoryMap/${getNetworkFileName(network)}.json`,
    list
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
/*
spot / derivative - slug<>marketId map
*/
