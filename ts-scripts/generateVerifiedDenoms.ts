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
import { getMarketByTicker } from './helper/market'
import {
  readJSONFile,
  updateJSONFile,
  tokenToAddressMap,
  getNetworkFileName
} from './helper/utils'

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

const getHardcodedDenoms = async (network: Network) => {
  let tokenMap = mainnetTokensMap
  let hardcodedDenoms = mainnetDenoms

  if (isDevnet(network)) {
    tokenMap = devnetTokensMap
    hardcodedDenoms = devnetDenoms
  }

  if (isTestnet(network)) {
    tokenMap = testnetTokensMap
    hardcodedDenoms = testnetDenoms
  }

  return hardcodedDenoms.reduce((list, denom) => {
    const token = tokenMap[denom]

    if (!token) {
      return list
    }

    return { ...list, [denom]: token }
  }, {} as Record<string, any>)
}

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

  const hardcodedDenoms = await getHardcodedDenoms(network)

  await updateJSONFile(
    `json/helix/trading/denoms/${getNetworkFileName(network)}.json`,
    { ...verifiedDenoms, ...hardcodedDenoms }
  )
}

generateTradableDenoms(Network.Devnet)
generateTradableDenoms(Network.TestnetSentry)
generateTradableDenoms(Network.MainnetSentry)
