import { toBase64, ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { readJSONFile, updateJSONFile, wasmErrorToMessageArray, getNetworkFileName } from './helper/utils'
import { fetchCodeIdsByNetwork, getContractAddressByCodeId } from './helper/wasm'

export const generateWasmQueryMessages = async (network: Network) => {
  const queryPath = `wasm/query/${getNetworkFileName(network)}.json`
  const existingCodeIdToQueryMessagesMap = readJSONFile({ path: queryPath, fallback: {} })
  const codeIdsList = fetchCodeIdsByNetwork(network)

  try {
    const endpoints = getNetworkEndpoints(network)
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)

    for (const codeId of codeIdsList) {
      if (Object.keys(existingCodeIdToQueryMessagesMap).includes(codeId)) {
        continue
      }

      const contractAddress = await getContractAddressByCodeId(network, codeId)

      if (!contractAddress) {
        continue
      }

      const queryToGetBackMessageList = { '': {} }
      const messageToBase64 = toBase64(queryToGetBackMessageList)

      try {
        await wasmApi.fetchSmartContractState(contractAddress, messageToBase64)
      } catch (e) {
        const messages = wasmErrorToMessageArray(e)
        existingCodeIdToQueryMessagesMap[codeId] = messages
      }
    }

    await updateJSONFile(queryPath, existingCodeIdToQueryMessagesMap)
    console.log(`✅✅✅ generateWasmQueryMessages ${network}`)
  } catch (e) {
    console.log('Error in generating Wasm Query Messages', e)
  }
}

generateWasmQueryMessages(Network.Devnet)
generateWasmQueryMessages(Network.TestnetSentry)
generateWasmQueryMessages(Network.MainnetSentry)
