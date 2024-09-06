import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { readJSONFile, getNetworkFileName } from './utils'

export const fetchCodeIdsByNetwork = (network: Network): string => {
  const path = `data/wasm/codeIds/${getNetworkFileName(network)}.json`

  return readJSONFile({ path, fallback: [] })
}

export const getContractAddressByCodeId = async (
  network: Network,
  codeId: string
): Promise<string | undefined> => {
  console.log('Fetching Contract Address for Code ID:', codeId)
  try {
    const endpoints = getNetworkEndpoints(network)
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)

    // Fetch contracts associated with the codeId
    const { contractsList } = await wasmApi.fetchContractCodeContracts(Number(codeId))
    const [contractAddress] = contractsList

    // Return the first contract address found
    return contractAddress
  } catch (e) {
    console.log('Error fetching contract address for Code ID:', codeId)
    console.log(e)
    return undefined // Return undefined if there's an error
  }
}

