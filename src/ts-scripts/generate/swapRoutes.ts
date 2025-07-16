import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import {
  devnetSwapRoutes,
  testnetSwapRoutes,
  mainnetSwapRoutes
} from '../../data/swapRoutes'
import { updateJSONFile, getNetworkFileName } from '../helper/utils'

const getFormattedSwapRoutes = (network: Network) => {
  if (isDevnet(network)) {
    return devnetSwapRoutes
  }

  if (isTestnet(network)) {
    return testnetSwapRoutes
  }

  return mainnetSwapRoutes
}

const generateSwapRoutes = async (network: Network) => {
  const routes = getFormattedSwapRoutes(network)

  try {
    await updateJSONFile(
      `json/helix/trading/swap/${getNetworkFileName(network)}.json`,
      routes.map((route) => ({
        steps: route.steps,
        source_denom: route.source_denom,
        target_denom: route.target_denom
      }))
    )

    console.log(`✅✅✅ generated swap routes ${network}`)
  } catch (e) {
    console.log(`Error generating swap routes ${network}:`, e)
  }
}

generateSwapRoutes(Network.MainnetSentry)
