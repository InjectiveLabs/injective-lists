import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { BaseAccount, ChainRestAuthApi, createTransaction, MsgExecuteContractCompat, TxGrpcClient } from '@injectivelabs/sdk-ts'
import { readJSONFile, updateJSONFile, getChainIdFromNetwork, getFeePayerInjectiveAddress, wasmErrorToMessageArray, getNetworkFileName } from './helper/utils'
import { fetchCodeIdsByNetwork, getContractAddressByCodeId } from './helper/wasm'

const getAccountDetails = async (address: string, network: Network): Promise<BaseAccount> => {
  console.log('Fetching account details for', address)
  const endpoints = getNetworkEndpoints(network)
  const chainRestAuthApi = new ChainRestAuthApi(endpoints.rest)
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address)

  return BaseAccount.fromRestApi(accountDetailsResponse)
}

export const generateWasmExecuteMessages = async (network: Network) => {
  console.log('Generating Wasm Execute Messages for', network)
  const executePath = `wasm/execute/${getNetworkFileName(network)}.json`
  const existingCodeIdToExecuteMessagesMap = readJSONFile({ path: executePath, fallback: {} })
  const codeIdsList = fetchCodeIdsByNetwork(network)

  try {
    const endpoints = getNetworkEndpoints(network)
    const txService = new TxGrpcClient(endpoints.grpc)
    const injectiveAddress = getFeePayerInjectiveAddress(network)

    for (const codeId of codeIdsList) {
      if (Object.keys(existingCodeIdToExecuteMessagesMap).includes(codeId)) {
        console.log(`Skipping fetch for existing code ID: ${codeId}`)
        continue
      }

      console.log(`Fetching contract address for code ID: ${codeId}`)
      const contractAddress = await getContractAddressByCodeId(network, codeId)

      if (!contractAddress) {
        console.log(`No contract address found for code ID: ${codeId}`)
        continue
      }

      console.log(`Fetching execute messages for contract address: ${contractAddress}`)
      const accountDetails = (await getAccountDetails(injectiveAddress, network)).toAccountDetails()
      const initialMessageToGetBackMessageList = '{"": {}}'
      const msgs = MsgExecuteContractCompat.fromJSON({
        contractAddress: contractAddress,
        sender: injectiveAddress,
        msg: Buffer.from(initialMessageToGetBackMessageList),
        funds: [],
      })

      try {
        const { txRaw } = createTransaction({
          chainId: getChainIdFromNetwork(network),
          message: msgs,
          pubKey: accountDetails.pubKey.key,
          sequence: accountDetails.sequence,
          accountNumber: accountDetails.accountNumber,
        })

        await txService.simulate(txRaw)
      } catch (e) {
        const messages = wasmErrorToMessageArray(e)
        existingCodeIdToExecuteMessagesMap[codeId] = messages
        console.log(`Storing messages for code ID: ${codeId}`)
      }
    }

    await updateJSONFile(executePath, existingCodeIdToExecuteMessagesMap)
  } catch (e) {
    console.log('Error in generating Wasm Execute Messages', e)
  }
}

generateWasmExecuteMessages(Network.Devnet)
generateWasmExecuteMessages(Network.TestnetSentry)
generateWasmExecuteMessages(Network.MainnetSentry)
