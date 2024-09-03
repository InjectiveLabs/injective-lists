import { toBase64, ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

const mainnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.MainnetSentry).grpc
)

const testnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.TestnetSentry).grpc
)

const devnetWasmApi = new ChainGrpcWasmApi(getNetworkEndpoints(Network.Devnet).grpc)

const getWasmApi = (network: Network): ChainGrpcWasmApi => {
  if (isDevnet(network)) {
    return devnetWasmApi
  }

  if (isTestnet(network)) {
    return testnetWasmApi
  }

  return mainnetWasmApi
}

export const fetchQueryMessages = async (contractAddress, network: Network) => {
  try {
    const wasmApi = getWasmApi(network)

    const queryToGetBackMessageList = { '': {} }
    const messageToBase64 = toBase64(queryToGetBackMessageList)

    // will need some try catch here to parse out the messages
    await wasmApi.fetchSmartContractState(contractAddress, messageToBase64)


  } catch (e) {
   const path = `data/wasm/query/${getNetworkFileName(network)}.json`

   // todo: get messages from error via helper fn
//const messages = getMessagesFromError(e)

// todo: update json file with messages

// return messages
    console.log(`✅✅✅ fetchWasmQueries ${network}`)
  }
}
