import { writeFileSync } from 'node:fs'
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
import { getNetworkFileName } from './helper/utils'

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

  writeFileSync(
    `./../helix/trading/spot/${getNetworkFileName(network)}.json`,
    JSON.stringify(slugs, null, 2)
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

  writeFileSync(
    `./../helix/trading/derivative/${getNetworkFileName(network)}.json`,
    JSON.stringify(slugs, null, 2)
  )
}

generateSpotMarketSlugs(Network.Devnet)
generateSpotMarketSlugs(Network.Staging)
generateSpotMarketSlugs(Network.TestnetSentry)
generateSpotMarketSlugs(Network.MainnetSentry)

generateDerivativeMarketSlugs(Network.Devnet)
generateDerivativeMarketSlugs(Network.Staging)
generateDerivativeMarketSlugs(Network.TestnetSentry)
generateDerivativeMarketSlugs(Network.MainnetSentry)
