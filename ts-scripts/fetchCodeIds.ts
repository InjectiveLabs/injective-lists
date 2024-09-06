import { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { getNetworkFileName, updateJSONFile } from './helper/utils'
import { fetchCodeIdsByNetwork } from './helper/wasm'

export const fetchCodeIds = async (network: Network) => {
  const codeIds = [] as number[]
  const endpoints = getNetworkEndpoints(network)
  const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)
  const existingCodeIdsList = fetchCodeIdsByNetwork(network)

  try {
    let nextKey

    do {
      const { pagination, codeInfosList } = await wasmApi.fetchContractCodes({
        key: nextKey
      })

      const newCodeIds = codeInfosList.map(({ codeId }) => codeId)
      codeIds.push(...newCodeIds)

      nextKey = pagination?.next
    } while (nextKey)

    await updateJSONFile(
      `data/wasm/codeIds/${getNetworkFileName(network)}.json`,
      [...new Set([...existingCodeIdsList, ...codeIds])]
    )

    console.log(`✅✅✅ fetchCodeIds ${network}`)
  } catch (e) {
    console.log('Error fetching all code IDs', e)
  }
}

fetchCodeIds(Network.Devnet)
fetchCodeIds(Network.TestnetSentry)
fetchCodeIds(Network.MainnetSentry)
