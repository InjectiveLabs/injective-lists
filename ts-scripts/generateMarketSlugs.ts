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

export const generateMarketCategorySlugs = async () => {
  await updateJSONFile('helix/trading/market/category.json', {
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

generateMarketCategorySlugs()
