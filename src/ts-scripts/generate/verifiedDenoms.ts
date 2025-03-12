import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetDenoms as devnetDenoms,
  mainnetDenoms as mainnetDenoms,
  testnetDenoms as testnetDenoms
} from '../../data/tokens/denoms'
import {
  devnetMarketIds as devnetSpotMarketIds,
  stagingMarketIds as stagingSpotMarketIds,
  mainnetMarketIds as mainnetSpotMarketIds,
  testnetMarketIds as testnetSpotMarketIds
} from '../../data/market/spot'
import {
  readJSONFile,
  updateJSONFile,
  tokensToDenomMap,
  getNetworkFileName
} from '../helper/utils'
import { getMarketById } from '../helper/market'

const devnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/devnet.json'
  })
)
const testnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/testnet.json'
  })
)
const mainnetTokensMap = tokensToDenomMap(
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
    const token = tokenMap[denom.toLowerCase()]

    if (!token) {
      return list
    }

    list[denom] = token

    return list
  }, {} as Record<string, any>)
}

const getTradableMarketIds = (network: Network) => {
  let marketIds = mainnetSpotMarketIds

  if (network === Network.Staging) {
    return [...marketIds, ...stagingSpotMarketIds]
  }

  if (isDevnet(network)) {
    return [...marketIds, ...devnetSpotMarketIds]
  }

  if (isTestnet(network)) {
    return [...marketIds, ...testnetSpotMarketIds]
  }

  return marketIds
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
      [market.baseDenom]: tokenMap[market.baseDenom.toLowerCase()],
      [market.quoteDenom]: tokenMap[market.quoteDenom.toLowerCase()]
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
