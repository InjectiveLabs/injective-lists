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
import { fetchExecuteMessages } from './fetchWasmExecuteMessages'

const getCodeIds = async (network: Network) => {
  const path = `data/wasm/codeIds/${getNetworkFileName(network)}.json`

  const existingCodeIdsList = readJSONFile({ path, fallback: [] })

  try {
    let nextKey
    const codeIds = [] as string[]
    const endpoints = getNetworkEndpoints(network)
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)


    while (nextKey) {
      const { pagination, codeInfosList } = await wasmApi.fetchContractCodes()

      const codeIds = codeInfosList.map((codeInfo) => codeInfo.codeId)
      codeIds.push(...codeIds)

      nextKey = pagination.next
    }

    const updatedCodeIdsList = [...new Set([...existingCodeIdsList, ...codeIds])]

    await updateJSONFile(path, updatedCodeIdsList)

    return codeIds
  } catch (e) {
    console.log('Error fetching all code ids')

    console.log(e)

    return readJSONFile({ path })
  }
}


const getContractAddresses = async (network: Network) => {
  try {
    const endpoints = getNetworkEndpoints(network)
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)

    const codeIds = await getCodeIds(network)

    return (await Promise.all(
      codeIds.map(async (codeId: string) => {
        const { contractsList } = await wasmApi.fetchContractCodeContracts(Number(codeId));

        const [contractAddresses] = contractsList

        return contractAddresses
      })
    )).filter(address => address)
  }
  catch (e) {
    console.log(
      'Error fetching all contract addresses'
    )

    console.log(e)
  }
}


const generateWasmMessages = async (network: Network) => {
  const queryPath = `wasm/query/${getNetworkFileName(network)}.json`
  const executePath = `wasm/execute/${getNetworkFileName(network)}.json`

  try {
    const contractAddressesFromApi = await getContractAddresses(network)

    const existingCodeIdToQueryMessagesMap = readJSONFile({ path: queryPath })
    const existingCodeIdToExecuteMessagesMap = readJSONFile({ path: executePath })

    if (!contractAddressesFromApi) {
      return
    }

    const codeIdToQueryMessagesMap = await Promise.all(
      contractAddressesFromApi.map(async (contractAddress: string) => {
        if (existingCodeIdToQueryMessagesMap[contractAddress]) {
          return existingCodeIdToQueryMessagesMap[contractAddress]
        }

        const queryMessages = await fetchQueryMessages(contractAddress, network)

        return { [contractAddress]: queryMessages };
      })
    ).then((results) => results.reduce((acc, curr) => ({ ...acc, ...curr }), {}));

    await updateJSONFile(queryPath, codeIdToQueryMessagesMap)

    const codeIdToExecuteMessagesMap = await Promise.all(
      contractAddressesFromApi.map(async (contractAddress: string) => {
        if (existingCodeIdToExecuteMessagesMap[contractAddress]) {
          return existingCodeIdToExecuteMessagesMap[contractAddress]
        }

        const queryMessages = await fetchExecuteMessages(contractAddress, network)

        return { [contractAddress]: queryMessages };
      })
    ).then((results) => results.reduce((acc, curr) => ({ ...acc, ...curr }), {}));

    await updateJSONFile(executePath, codeIdToExecuteMessagesMap)
  } catch (e) {
    console.log('Error generateWasmMessages', e)

    return
  }
}

generateWasmMessages(Network.Devnet)
generateWasmMessages(Network.TestnetSentry)
generateWasmMessages(Network.MainnetSentry)

