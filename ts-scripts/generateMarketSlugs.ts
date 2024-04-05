import { writeFile } from 'node:fs'
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
import { getNetworkFileName } from './helper/utils'

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

  writeFile(
    `./../helix/trading/expiry/${getNetworkFileName(network)}.json`,
    JSON.stringify(slugs, null, 2),
    (err) => {
      if (err) {
        console.error(
          `Error writing expiry futures market slugs ${network}:`,
          err
        )
      }
    }
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

  writeFile(
    `./../helix/trading/spot/${getNetworkFileName(network)}.json`,
    JSON.stringify(slugs, null, 2),
    (err) => {
      if (err) {
        console.error(`Error writing spot market slugs ${network}:`, err)
      }
    }
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

  writeFile(
    `./../helix/trading/derivative/${getNetworkFileName(network)}.json`,
    JSON.stringify(slugs, null, 2),
    (err) => {
      if (err) {
        console.error(`Error writing derivative market slugs ${network}:`, err)
      }
    }
  )
}

export const generateMarketCategorySlugs = () => {
  writeFile(
    `./../helix/trading/market/category.json`,
    JSON.stringify(
      {
        cosmosCategorySlugs,
        solanaCategorySlugs,
        ethereumCategorySlugs,
        injectiveCategorySlugs,
        newMarketsCategorySlugs,
        olpLowVolumeCategorySlugs,
        experimentalCategorySlugs
      },
      null,
      2
    ),
    (err) => {
      if (err) {
        console.error('Error writing market category slugs:', err)
      }
    }
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

generateMarketCategorySlugs()
