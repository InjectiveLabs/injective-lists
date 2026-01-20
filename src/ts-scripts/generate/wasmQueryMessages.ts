import { toBase64, ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../helper/utils'
import {
  fetchCodeIdsByNetwork,
  wasmErrorToMessageArray,
  getContractAddressByCodeId
} from '../helper/wasm'

const args = process.argv.slice(2)
const shouldForceFetch = args.includes('-f') || args.includes('--force')

export const updateQueryMessageJson = async (
  network: Network,
  item: Record<string, string[]>
) => {
  const filePath = `json/wasm/query/${getNetworkFileName(network)}.json`

  const updatedList = {
    ...readJSONFile({
      path: filePath,
      fallback: {}
    }),
    ...item
  }

  try {
    await updateJSONFile(filePath, updatedList)
  } catch (e) {
    console.log('Error updating wasm query messages', e)
  }
}

export const generateWasmQueryMessages = async (network: Network) => {
  const codeIdsList = fetchCodeIdsByNetwork(network)

  const queryPath = `json/wasm/query/${getNetworkFileName(network)}.json`
  const existingCodeIdMessagesMap = readJSONFile({
    path: queryPath,
    fallback: {}
  }) as Record<string, string[]>

  const codeIdsToFetch = codeIdsList
    .filter(
      (codeId) => !Object.keys(existingCodeIdMessagesMap).includes(`${codeId}`)
    )
    .map((codeId) => `${codeId}`)

  const existingCodeIdsToRefetch = !shouldForceFetch
    ? []
    : Object.entries(existingCodeIdMessagesMap).reduce(
        (list, [codeId, messages]) => {
          if (messages.length === 0) {
            list.push(codeId)
          }

          return list
        },
        [] as string[]
      )

  const allCodeIdsToProcess = [...codeIdsToFetch, ...existingCodeIdsToRefetch]

  console.log(
    `fetching wasm query messages for ${network} codeIds:`,
    allCodeIdsToProcess
  )

  // Early return if no code IDs to process
  if (allCodeIdsToProcess.length === 0) {
    console.log(`✅✅✅ No wasm query messages to fetch for ${network}`)

    return
  }

  await fetchWasmQueryMessages(network, allCodeIdsToProcess)
}

export const fetchWasmQueryMessages = async (
  network: Network,
  codeIds: string[]
) => {
  const endpoints = getNetworkEndpoints(network)
  const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)

  try {
    for (const codeId of codeIds) {
      const contractAddress = await getContractAddressByCodeId(network, codeId)

      if (!contractAddress) {
        await updateQueryMessageJson(network, { [codeId]: [] })

        continue
      }

      const queryToGetBackMessageList = { '': {} }
      const messageToBase64 = toBase64(queryToGetBackMessageList)

      try {
        await wasmApi.fetchSmartContractState(contractAddress, messageToBase64)
      } catch (e) {
        await updateQueryMessageJson(network, {
          [codeId]: wasmErrorToMessageArray(e)
        })
      }
    }

    console.log(`✅✅✅ generateWasmQueryMessages ${network}`)
  } catch (e) {
    console.log('Error generating Wasm Query Messages', e)
  }
}

export const testMsg = (value: string): string[] => {
  const messageSupportedRegex =
    /Messages supported by this contract: (.*?)(?=: query wasm contract failed)/
  const contentMatch = messageSupportedRegex.exec(value)

  if (contentMatch && contentMatch[1]) {
    const content = contentMatch[1].split(',').map((each) => each.trim())

    return content.map((each) => each.trim())
  }

  const matches = value.match(/`(.*?)`/g)

  return Array.isArray(matches)
    ? matches.slice(1).map((match: string) => match.replace(/`/g, ''))
    : []
}

generateWasmQueryMessages(Network.TestnetSentry)
generateWasmQueryMessages(Network.MainnetSentry)
