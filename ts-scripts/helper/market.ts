import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { readJSONFile } from './utils'

const mainnetSpotMarkets = readJSONFile({
  path: 'data/market/spot/mainnet.json'
})
const testnetSpotMarkets = readJSONFile({
  path: 'data/market/spot/testnet.json'
})
const devnetSpotMarkets = readJSONFile({
  path: 'data/market/spot/devnet.json'
})

const mainnetDerivativeMarkets = readJSONFile({
  path: 'data/market/derivative/mainnet.json'
})
const testnetDerivativeMarkets = readJSONFile({
  path: 'data/market/derivative/testnet.json'
})
const devnetDerivativeMarkets = readJSONFile({
  path: 'data/market/derivative/devnet.json'
})

const spotMarketsByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetSpotMarkets
  }

  if (isTestnet(network)) {
    return testnetSpotMarkets
  }

  return devnetSpotMarkets
}

const derivativeMarketsByNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetDerivativeMarkets
  }

  if (isTestnet(network)) {
    return testnetDerivativeMarkets
  }

  return devnetDerivativeMarkets
}

export const getMarketsByDenom = (denom: string, network: Network) => {
  const spotMarkets = spotMarketsByNetwork(network)
  const derivativeMarkets = derivativeMarketsByNetwork(network)

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
  const spotMarkets = spotMarketsByNetwork(network)
  const derivativeMarkets = derivativeMarketsByNetwork(network)

  return [...spotMarkets, ...derivativeMarkets].find(
    (market) => market.marketId === marketId
  )
}
