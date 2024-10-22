import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetSlugs as devnetSpotSlugs,
  mainnetSlugs as mainnetSpotSlugs,
  testnetSlugs as testnetSpotSlugs,
  stagingSlugs as stagingSpotSlug
} from './data/market/spot'
import { getMarketByTicker } from './helper/market'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

// helix/trading/denoms/mainnet.json

const getNetworkSlugs = (network: Network) => {
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

  return mainnetSpotSlugs
}

export const generateTradableDenoms = async (network: Network) => {
  const slugs = getNetworkSlugs(network)

  const verifiedDenoms = slugs.reduce((list, slug) => {
    const ticker = slug.replace('-', '/').toUpperCase()

    const market = getMarketByTicker(ticker, network)

    if (!market) {
      return list
    }

    return {
      ...list,
      [market.baseDenom]: market.baseToken,
      [market.quoteDenom]: market.quoteToken
    }
  }, {} as Record<string, any>)

  await updateJSONFile(
    `json/helix/trading/denoms/${getNetworkFileName(network)}.json`,
    verifiedDenoms
  )
}

generateTradableDenoms(Network.Devnet)
generateTradableDenoms(Network.TestnetSentry)
generateTradableDenoms(Network.MainnetSentry)
