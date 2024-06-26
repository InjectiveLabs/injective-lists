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
    `helix/trading/expiry/${getNetworkFileName(network)}.json`,
    slugs
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
    `helix/trading/spot/${getNetworkFileName(network)}.json`,
    slugs
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
    `helix/trading/derivative/${getNetworkFileName(network)}.json`,
    slugs
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
    `helix/trading/gridMarkets/spot/${getNetworkFileName(network)}.json`,
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
    `helix/trading/gridMarkets/derivative/${getNetworkFileName(network)}.json`,
    gridMarkets
  )
}

export const generateMarketCategorySlugs = async () => {
  await updateJSONFile('helix/trading/market/category.json', {
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
