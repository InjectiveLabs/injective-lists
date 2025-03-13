import {
  TxGrpcApi,
  BaseAccount,
  ChainRestAuthApi,
  createTransaction,
  MsgExecuteContractCompat
} from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName,
  getChainIdFromNetwork
} from '../helper/utils'
import {
  fetchCodeIdsByNetwork,
  wasmErrorToMessageArray,
  getContractAddressByCodeId,
  getFeePayerInjectiveAddress
} from '../helper/wasm'

const args = process.argv.slice(2)
const shouldForceFetch = args.includes('-f') || args.includes('--force')

const getAccountDetails = async (
  address: string,
  network: Network
): Promise<BaseAccount> => {
  const endpoints = getNetworkEndpoints(network)
  const chainRestAuthApi = new ChainRestAuthApi(endpoints.rest)
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address)

  return BaseAccount.fromRestApi(accountDetailsResponse)
}

export const updateExecuteMessageJson = async (
  network: Network,
  item: Record<string, string[]>
) => {
  const filePath = `json/wasm/execute/${getNetworkFileName(network)}.json`

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
    console.log('Error updating wasm execute messages', e)
  }
}

export const generateWasmExecuteMessages = async (network: Network) => {
  const codeIdsList = fetchCodeIdsByNetwork(network)

  const queryPath = `json/wasm/execute/${getNetworkFileName(network)}.json`
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

  console.log(`fetching wasm execute messages for ${network} codeIds:`, [
    ...codeIdsToFetch,
    ...existingCodeIdsToRefetch
  ])

  await fetchWasmExecuteMessages(network, [
    ...codeIdsToFetch,
    ...existingCodeIdsToRefetch
  ])
}

export const fetchWasmExecuteMessages = async (
  network: Network,
  codeIds: string[]
) => {
  try {
    const endpoints = getNetworkEndpoints(network)
    const txService = new TxGrpcApi(endpoints.grpc)
    const injectiveAddress = getFeePayerInjectiveAddress(network)

    for (const codeId of codeIds) {
      const contractAddress = await getContractAddressByCodeId(network, codeId)

      if (!contractAddress) {
        await updateExecuteMessageJson(network, { [codeId]: [] })

        continue
      }

      const initialMessageToGetBackMessageList = '{"": {}}'
      const msgs = MsgExecuteContractCompat.fromJSON({
        contractAddress: contractAddress,
        sender: injectiveAddress,
        msg: Buffer.from(initialMessageToGetBackMessageList),
        funds: []
      })

      try {
        const accountDetails = (
          await getAccountDetails(injectiveAddress, network)
        ).toAccountDetails()

        const { txRaw } = createTransaction({
          chainId: getChainIdFromNetwork(network),
          message: msgs,
          pubKey: accountDetails.pubKey.key,
          sequence: accountDetails.sequence,
          accountNumber: accountDetails.accountNumber
        })

        await txService.simulate(txRaw)
      } catch (e) {
        await updateExecuteMessageJson(network, {
          [codeId]: wasmErrorToMessageArray(e)
        })
      }
    }

    console.log(`✅✅✅ generateWasmExecuteMessages ${network}`)
  } catch (e) {
    console.log('Error generating Wasm Execute Messages', e)
  }
}

generateWasmExecuteMessages(Network.Devnet)
generateWasmExecuteMessages(Network.TestnetSentry)
generateWasmExecuteMessages(Network.MainnetSentry)
