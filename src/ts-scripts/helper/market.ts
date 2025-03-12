import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { readJSONFile } from './utils'

const mainnetSpotMarkets = readJSONFile({
  path: 'src/cache/market/spot/mainnet.json'
})
const testnetSpotMarkets = readJSONFile({
  path: 'src/cache/market/spot/testnet.json'
})
const devnetSpotMarkets = readJSONFile({
  path: 'src/cache/market/spot/devnet.json'
})

const mainnetDerivativeMarkets = readJSONFile({
  path: 'src/cache/market/derivative/mainnet.json'
})
const testnetDerivativeMarkets = readJSONFile({
  path: 'src/cache/market/derivative/testnet.json'
})
const devnetDerivativeMarkets = readJSONFile({
  path: 'src/cache/market/derivative/devnet.json'
})

const mainnetSpotMarketMap = readJSONFile({
  path: 'src/generated/market/spot/slugMap/mainnet.json',
  fallback: {}
})

const testnetSpotMarketMap = readJSONFile({
  path: 'src/generated/market/spot/slugMap/testnet.json',
  fallback: {}
})

const devnetSpotMarketMap = readJSONFile({
  path: 'src/generated/market/spot/slugMap/devnet.json',
  fallback: {}
})

const mainnetDerivativeMarketMap = readJSONFile({
  path: 'src/generated/market/derivative/slugMap/mainnet.json',
  fallback: {}
})

const testnetDerivativeMarketMap = readJSONFile({
  path: 'src/generated/market/derivative/slugMap/testnet.json',
  fallback: {}
})

const devnetDerivativeMarketMap = readJSONFile({
  path: 'src/generated/market/derivative/slugMap/devnet.json',
  fallback: {}
})

export const getSpotMarketsByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetSpotMarkets
  }

  if (isTestnet(network)) {
    return testnetSpotMarkets
  }

  return devnetSpotMarkets
}

export const getDerivativeMarketsByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetDerivativeMarkets
  }

  if (isTestnet(network)) {
    return testnetDerivativeMarkets
  }

  return devnetDerivativeMarkets
}

export const getSpotMarketMapByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetSpotMarketMap
  }

  if (isTestnet(network)) {
    return testnetSpotMarketMap
  }

  return devnetSpotMarketMap
}

export const getDerivativeMarketMapByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetDerivativeMarketMap
  }

  if (isTestnet(network)) {
    return testnetDerivativeMarketMap
  }

  return devnetDerivativeMarketMap
}

export const filterMarketMapByMarketId = (
  marketIds: string[],
  network: Network
) => {
  const spotMarketMap = getSpotMarketMapByNetwork(network)
  const derivativeMarketMap = getDerivativeMarketMapByNetwork(network)

  return marketIds
    .map((marketId) => spotMarketMap[marketId] || derivativeMarketMap[marketId])
    .filter((market) => market)
}

export const getMarketByTicker = (ticker: string, network: Network) => {
  const spotMarkets = getSpotMarketsByNetwork(network)
  const derivativeMarkets = getDerivativeMarketsByNetwork(network)

  return [...spotMarkets, ...derivativeMarkets].find(
    (market) => market.ticker.toUpperCase() === ticker
  )
}

export const getMarketsByDenom = (denom: string, network: Network) => {
  const spotMarkets = getSpotMarketsByNetwork(network)
  const derivativeMarkets = getDerivativeMarketsByNetwork(network)

  const formattedDenom = denom.toLowerCase()

  return [...spotMarkets, ...derivativeMarkets].filter((market) => {
    return (
      market?.baseDenom?.toLowerCase() === formattedDenom ||
      market.quoteDenom.toLowerCase() === formattedDenom
    )
  })
}

export const getMarketIdsByDenom = (denom: string, network: Network) => {
  const markets = getMarketsByDenom(denom, network)

  return markets.map((market) => market.marketId)
}

export const getMarketById = (marketId: string, network: Network) => {
  const spotMarkets = getSpotMarketsByNetwork(network)
  const derivativeMarkets = getDerivativeMarketsByNetwork(network)

  return [...spotMarkets, ...derivativeMarkets].find(
    (market) => market.marketId === marketId
  )
}
