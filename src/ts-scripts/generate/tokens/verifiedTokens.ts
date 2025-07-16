import { Network } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../../helper/utils'
import {
  getSpotMarketsByNetwork,
  getDerivativeMarketsByNetwork
} from '../../helper/market'
import {
  SpotMarket,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/sdk-ts'

async function generateVerifiedTokensList(network: Network) {
  const spotMarkets = getSpotMarketsByNetwork(network)
  const derivativeMarkets = getDerivativeMarketsByNetwork(network)

  const tradeableDenoms = new Set<string>([])

  spotMarkets.forEach((market: SpotMarket) => {
    tradeableDenoms.add(market.baseDenom)
    tradeableDenoms.add(market.quoteDenom)
  })

  derivativeMarkets.forEach((market: SpotMarket) => {
    tradeableDenoms.add(market.quoteDenom)
  })

  const tokenList = readJSONFile({
    path: `tokens/${getNetworkFileName(network)}.json`
  })

  const filteredTokenList = tokenList.filter((token: TokenStatic) => {
    return (
      tradeableDenoms.has(token.denom) ||
      token.tokenVerification === TokenVerification.Verified
    )
  })

  await updateJSONFile(
    `json/tokens/verified/${getNetworkFileName(network)}.json`,
    filteredTokenList
  )
}

generateVerifiedTokensList(Network.Devnet)
generateVerifiedTokensList(Network.TestnetSentry)
generateVerifiedTokensList(Network.MainnetSentry)
