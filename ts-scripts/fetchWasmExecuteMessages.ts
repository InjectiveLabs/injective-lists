import {
  Network,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import {
  BaseAccount,
  ChainRestAuthApi,
  createTransaction,
  MsgExecuteContractCompat,
  TxGrpcClient
} from '@injectivelabs/sdk-ts'
import { getChainIdFromNetwork, getFeePayerInjectiveAddress, wasmErrorToMessageArray } from './helper/utils'

const getAccountDetails = async (
  address: string, network: Network
): Promise<BaseAccount> => {
  const endpoints = getNetworkEndpoints(network)

  const chainRestAuthApi = new ChainRestAuthApi(endpoints.rest)
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address)

  return BaseAccount.fromRestApi(accountDetailsResponse)
}

export const fetchExecuteMessages = async (contractAddress: string, network: Network) => {
  const chainId = getChainIdFromNetwork(network)
  const endpoints = getNetworkEndpoints(network)
  const txService = new TxGrpcClient(endpoints.grpc)
  const injectiveAddress = getFeePayerInjectiveAddress(network)

  try {
    const accountDetails = (
    await getAccountDetails(injectiveAddress, network)
  ).toAccountDetails()

  const initialMessageToGetBackMessageList = '{"": {}}'

  const msgs = MsgExecuteContractCompat.fromJSON({
    contractAddress,
    sender: injectiveAddress,
    msg: Buffer.from(initialMessageToGetBackMessageList),
    funds: []
  })

  const { txRaw } = createTransaction({
    chainId,
    message: msgs,
    pubKey: accountDetails.pubKey.key,
    sequence: accountDetails.sequence,
    accountNumber: accountDetails.accountNumber
  })

    await txService.simulate(txRaw)
  } catch (e) {
    return wasmErrorToMessageArray(e)
  }
}
