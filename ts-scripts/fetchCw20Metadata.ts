import {
  TokenInfo,
  ContractInfo,
  MarketingInfo,
  ChainGrpcWasmApi,
  isCw20ContractAddress,
  ContractStateWithPagination
} from '@injectivelabs/sdk-ts'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints,
  getCw20AdapterContractForNetwork
} from '@injectivelabs/networks'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { Cw20ContractSource } from './types'

const mainnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.MainnetSentry).grpc
)

const testnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.TestnetSentry).grpc
)

const formatCW20Token = ({
  address,
  tokenInfo,
  contractInfo,
  marketingInfo,
  adapterContractAddress
}: {
  address: string
  tokenInfo: TokenInfo
  marketingInfo?: MarketingInfo
  contractInfo: ContractInfo
  adapterContractAddress: string
}): Cw20ContractSource => {
  return {
    name:
      tokenInfo.name || contractInfo.label || untaggedSymbolMeta.Unknown.name,
    logo: marketingInfo?.logo?.url || untaggedSymbolMeta.Unknown.logo,
    symbol: tokenInfo?.symbol || untaggedSymbolMeta.Unknown.symbol,
    decimals: tokenInfo.decimals,
    coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
    denom: `factory/${adapterContractAddress}/${address}`,
    address,
    tokenType: TokenType.Cw20,
    tokenVerification: TokenVerification.Internal,
    label: contractInfo.label,
    codeId: contractInfo.codeId,
    creator: contractInfo.creator
  }
}

export const fetchCw20ContractMetaData = async (
  denom: string,
  network: Network
) => {
  try {
    const address = isCw20ContractAddress(denom)
      ? denom
      : denom.split('/').pop()

    if (!address || isDevnet(network) || !isCw20ContractAddress(address)) {
      return
    }

    const existingCW20TokensMap = readJSONFile({
      path: `tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
      fallback: {}
    })
    const existingCW20Token = existingCW20TokensMap[denom.toLowerCase()]

    if (existingCW20Token) {
      return existingCW20Token
    }

    const wasmApi = isTestnet(network) ? testnetWasmApi : mainnetWasmApi

    const contractInfoResponse = (await wasmApi
      .fetchContractInfo(address)
      .catch((e: any) => {
        console.warn(
          `Peggy: Failed to fetch cw20 contract info for address: ${address} on ${network}`,
          e
        )
      })) as ContractInfo | undefined

    const contractStateResponse = (await wasmApi
      .fetchContractState({
        contractAddress: address,
        pagination: { reverse: true }
      })
      .catch((e: any) => {
        console.warn(
          `Peggy: Failed to fetch cw20 token state for address: ${address} on ${network}`,
          e
        )
      })) as ContractStateWithPagination | undefined

    if (
      !contractStateResponse ||
      !contractStateResponse.tokenInfo ||
      !contractInfoResponse
    ) {
      return
    }

    const adapterContractAddress = getCw20AdapterContractForNetwork(network)

    const formattedToken = formatCW20Token({
      address,
      adapterContractAddress,
      contractInfo: contractInfoResponse,
      tokenInfo: contractStateResponse.tokenInfo,
      marketingInfo: contractStateResponse.marketingInfo
    })

    await updateJSONFile(
      `tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
      {
        ...existingCW20TokensMap,
        [address.toLowerCase()]: formattedToken
      }
    )

    return formattedToken
  } catch (e) {
    console.log(`Error fetching cw20 contract state ${network} ${denom}:`, e)
  }
}
