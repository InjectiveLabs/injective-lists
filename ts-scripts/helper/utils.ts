import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'

export const getNetworkFileName = (network: Network) => {
  if (network === Network.Staging) {
    return 'staging'
  }

  if (isMainnet(network)) {
    return 'mainnet'
  }

  if (isTestnet(network)) {
    return 'testnet'
  }

  return 'devnet'
}
