import 'dotenv/config'
import {
  Network,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'
import { readJSONFile, getNetworkFileName } from './utils'

export const fetchCodeIdsByNetwork = (network: Network): number[] => {
  const path = `src/cache/wasm/codeIds/${getNetworkFileName(network)}.json`

  return readJSONFile({ path, fallback: [] })
}

export const getContractAddressByCodeId = async (
  network: Network,
  codeId: string
): Promise<string | undefined> => {
  try {
    const endpoints = getNetworkEndpoints(network)
    const wasmApi = new ChainGrpcWasmApi(endpoints.grpc)

    const { contractsList } = await wasmApi.fetchContractCodeContracts(
      Number(codeId)
    )

    return contractsList[0]
  } catch (e) {
    console.log('Error fetching contract address for Code ID:', codeId)
    console.log(e)

    return undefined
  }
}

export const getFeePayerInjectiveAddress = (network: Network) => {
  let feePayer = process.env.DEVNET_FEE_PAYER

  if (isMainnet(network)) {
    feePayer = process.env.MAINNET_FEE_PAYER
  }

  if (isTestnet(network)) {
    feePayer = process.env.TESTNET_FEE_PAYER
  }

  if (!feePayer) {
    throw new Error(`fee payer injective address for ${network} not found!`)
  }

  return feePayer
}

export const wasmErrorToMessageArray = (error: any): string[] => {
  const messageSupportedRegex =
    /Messages supported by this contract: (.*?)(?=: query wasm contract failed)/
  const contentMatch = messageSupportedRegex.exec(error.message)

  if (contentMatch && contentMatch[1]) {
    const content = contentMatch[1].split(',').map((each) => each.trim())

    console.log(content.map((each) => each.trim()))

    return content.map((each) => each.trim())
  }

  const matches = error.message.match(/`(.*?)`/g)

  console.log('Fallback Matches:', matches) // Debugging log

  return Array.isArray(matches)
    ? matches.slice(1).map((match: string) => match.replace(/`/g, ''))
    : []
}
