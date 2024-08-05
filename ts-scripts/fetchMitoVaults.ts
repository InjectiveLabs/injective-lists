import { IndexerGrpcMitoApi } from '@injectivelabs/sdk-ts'
import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

const MITO_DEVNET_API_ENDPOINT = 'https://devnet.api.ninja.injective.dev'
const MITO_TESTNET_API_ENDPOINT =
  'https://k8s.testnet.mito.grpc-web.injective.network'
const MITO_MAINNET_API_ENDPOINT =
  'https://k8s.global.mainnet.mito.grpc-web.injective.network'

const getMitoApiEndpoint = (network: Network): string => {
  if (isDevnet(network)) {
    return MITO_DEVNET_API_ENDPOINT
  }

  if (isTestnet(network)) {
    return MITO_TESTNET_API_ENDPOINT
  }

  return MITO_MAINNET_API_ENDPOINT
}

export const fetchMitoVaults = async (network: Network) => {
  try {
    const endpoint = getMitoApiEndpoint(network)
    const mitoApi = new IndexerGrpcMitoApi(endpoint)

    const response = await mitoApi.fetchVaults({ limit: 100 })

    // // cache data in case of api error
    await updateJSONFile(
      `data/mito/${getNetworkFileName(network)}.json`,
      response.vaults.sort((a, b) =>
        a.contractAddress.localeCompare(b.contractAddress)
      )
    )

    console.log(`✅✅✅ fetchMitoVaults ${network}`)
  } catch (e) {
    console.log(`Error fetching mito vaults ${network}:`, e)
  }
}

fetchMitoVaults(Network.Devnet)
fetchMitoVaults(Network.TestnetSentry)
fetchMitoVaults(Network.MainnetSentry)
