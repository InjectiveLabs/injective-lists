import { pathToFileURL } from 'node:url'
import { IndexerGrpcMitoApi } from '@injectivelabs/sdk-ts'
import { Network, isMainnet } from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from '../helper/utils'

const MITO_MAINNET_API_ENDPOINT =
  'https://k8s.global.mainnet.mito.grpc-web.injective.network'

export const fetchMitoVaults = async (network: Network) => {
  if (!isMainnet(network)) return

  try {
    const endpoint = MITO_MAINNET_API_ENDPOINT
    const mitoApi = new IndexerGrpcMitoApi(endpoint)

    const response = await mitoApi.fetchVaults({ limit: 100 })

    const formattedVaults = response.vaults.map((vault) => {
      const {
        apy,
        apyue,
        apy7D,
        apyV3,
        profits,
        apy7DFq,
        createdAt,
        updatedAt,
        currentTvl,
        lpTokenPrice,
        totalLpAmount,
        subaccountInfo,
        ...restOfVault
      } = vault

      return restOfVault
    })

    // // cache data in case of api error
    await updateJSONFile(
      `src/cache/mito/${getNetworkFileName(network)}.json`,
      formattedVaults.sort((a, b) =>
        a.contractAddress.localeCompare(b.contractAddress)
      )
    )

    console.log(`✅✅✅ fetchMitoVaults ${network}`)
  } catch (e) {
    console.log(`Error fetching mito vaults ${network}:`, e)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchMitoVaults(Network.MainnetSentry)
}
