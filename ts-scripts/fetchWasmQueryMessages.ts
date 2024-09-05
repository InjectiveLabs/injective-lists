
import { toBase64, ChainGrpcWasmApi } from '@injectivelabs/sdk-ts';
import { Network, getNetworkEndpoints } from '@injectivelabs/networks';
import { wasmErrorToMessageArray } from './helper/utils';

export const fetchQueryMessages = async (contractAddress: string, network: Network) => {
  try {
    const endpoints = getNetworkEndpoints(network);
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc);

    const queryToGetBackMessageList = { '': {} };
    const messageToBase64 = toBase64(queryToGetBackMessageList);

    await wasmApi.fetchSmartContractState(contractAddress, messageToBase64);
  } catch (e) {
    return wasmErrorToMessageArray(e);
  }
};
