import { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { fetchQueryMessages } from './fetchWasmQueryMessages'
// import { fetchExecuteMessages } from './fetchWasmExecuteMessages'

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

const getCodeIds = async (network: Network) => {
  const path = `data/codeIds/${getNetworkFileName(network)}.json`
  const codeIds = [] as string[]
  let nextKey

  try {
    const wasmApi = getWasmApi(network)


    while (nextKey) {
      const { pagination, codeInfosList } = await wasmApi.fetchContractCodes()

      const codeIds = codeInfosList.map((codeInfo) => codeInfo.codeId)
      codeIds.push(...codeIds)

      nextKey = pagination.next
    }

    // todo: make codeIds json
    // await updateJSONFile(path, response.data)

    return codeIds
  } catch (e) {
    console.log('Error fetching all code ids')

    console.log(e)

    return readJSONFile({ path })
  }
}


const getContractAddresses = async (network: Network) => {
  const path = `data/contractAddresses/${getNetworkFileName(network)}.json`

  try {
    const codeIds = await getCodeIds(network)

    const wasmApi = getWasmApi(network)

    const addresses = [] as string[]

    codeIds.forEach(async (codeId: string) => {
      const { contractsList } = await wasmApi.fetchContractCodeContracts(Number(codeId))

      const [contractAddresses] = contractsList

      addresses.push(contractAddresses)
    })

    // todo: make contractAddresses json
    // await updateJSONFile(path, response.data)
  }
  catch (e) {
    console.log(
      'Error fetching all contract addresses'
    )

    console.log(e)

    return readJSONFile({ path })
  }
}


const generateWasmMessages = async (network: Network) => {
 const path = `data/wasmMessages/${getNetworkFileName(network)}.json`

  try {
    const contractAddressesFromApi = await getContractAddresses(network)
    const contractAddressToQueryMessageMap = await readJSONFile({
      path: `data/wasm/query/${getNetworkFileName(network)}.json`
    })

    const contractToMessagesMap = await Promise.all(
      contractAddressesFromApi.map(async (contractAddress: string) => {
        const queryMessages = await fetchQueryMessages(contractAddress, network) || contractAddressToQueryMessageMap[contractAddress]
        // todo: implement execute
        // const executeMessages = await fetchExecuteMessages(contractAddress, network);

        // return { [contractAddress]: { query: queryMessages, execute: executeMessages } };
      })
    ).then((results) => results.reduce((acc, curr) => ({ ...acc, ...curr }), {}));

    // todo: make contractToMessagesMap json
    // await updateJSONFile(path, response.data)
  } catch (e) {
    console.log('Error generateWasmMessages', e)

    return
  }
}

generateWasmMessages(Network.Devnet)
generateWasmMessages(Network.TestnetSentry)
generateWasmMessages(Network.MainnetSentry)

