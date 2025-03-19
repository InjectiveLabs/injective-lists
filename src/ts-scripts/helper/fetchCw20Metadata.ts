import {
  TokenType,
  TokenStatic,
  ContractInfo,
  TokenVerification,
  ChainGrpcWasmApi,
  isCw20ContractAddress,
  ContractStateWithPagination
} from '@injectivelabs/sdk-ts'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { getBankTokenFactoryMetadataByAddress } from './getter'
import { untaggedSymbolMeta } from '../../data/tokens/untaggedSymbolMeta'
import { readJSONFile, updateJSONFile, getNetworkFileName } from './utils'
import { Cw20ContractSource, BankMetadata } from '../../types'

const mainnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.MainnetSentry).grpc
)

const testnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.TestnetSentry).grpc
)

const fetchContractDetails = async (address: string, network: Network) => {
  const path = `src/cache/cw20ContractSources/${getNetworkFileName(
    network
  )}.json`

  const existingCW20ContractSourcesMap = readJSONFile({
    path,
    fallback: {}
  })

  const cachedCw20Token = existingCW20ContractSourcesMap[address.toLowerCase()]

  if (cachedCw20Token) {
    return cachedCw20Token
  }

  const wasmApi = isTestnet(network) ? testnetWasmApi : mainnetWasmApi

  const contractInfoResponse = (await wasmApi
    .fetchContractInfo(address)
    .catch((e: any) => {
      if (!isDevnet(network)) {
        console.warn(
          `Peggy: Failed to fetch cw20 contract info for address: ${address} on ${network}`,
          e
        )
      }
    })) as ContractInfo | undefined

  const contractStateResponse = (await wasmApi
    .fetchContractState({
      contractAddress: address,
      pagination: { reverse: true }
    })
    .catch((e: any) => {
      if (!isDevnet(network)) {
        console.warn(
          `Peggy: Failed to fetch cw20 token state for address: ${address} on ${network}`,
          e
        )
      }
    })) as ContractStateWithPagination | undefined

  const cw20ContractSource: Cw20ContractSource = {
    address,
    info: contractInfoResponse,
    tokenInfo: contractStateResponse?.tokenInfo,
    contractInfo: contractStateResponse?.contractInfo,
    marketingInfo: contractStateResponse?.marketingInfo
  }

  if (contractStateResponse || contractInfoResponse) {
    await updateJSONFile(path, {
      ...existingCW20ContractSourcesMap,
      [address.toLowerCase()]: cw20ContractSource
    })
  }

  return cw20ContractSource
}

const formatCw20FactoryToken = ({
  address,
  bankMetadata,
  cw20ContractSource
}: {
  address: string
  bankMetadata?: BankMetadata
  cw20ContractSource?: Cw20ContractSource
}): TokenStatic => {
  const tokenInfo = cw20ContractSource?.tokenInfo
  const contractInfo = cw20ContractSource?.contractInfo
  const marketingInfo = cw20ContractSource?.marketingInfo

  return {
    coinGeckoId: '',
    address,
    name:
      tokenInfo?.name ||
      contractInfo?.label ||
      bankMetadata?.name ||
      untaggedSymbolMeta.Unknown.name,
    denom: bankMetadata?.denom || '',
    decimals:
      bankMetadata?.decimals ||
      tokenInfo?.decimals ||
      untaggedSymbolMeta.Unknown.decimals,
    logo: untaggedSymbolMeta.Unknown.logo,
    symbol:
      tokenInfo?.symbol ||
      bankMetadata?.symbol ||
      untaggedSymbolMeta.Unknown.symbol,
    externalLogo: marketingInfo?.logo?.url || untaggedSymbolMeta.Unknown.logo,
    tokenType: TokenType.TokenFactory,
    tokenVerification: TokenVerification.Unverified
  }
}

const formatCw20Token = (
  cw20ContractSource: Cw20ContractSource
): TokenStatic => {
  const tokenInfo = cw20ContractSource?.tokenInfo
  const contractInfo = cw20ContractSource?.contractInfo
  const marketingInfo = cw20ContractSource?.marketingInfo

  return {
    name:
      tokenInfo?.name || contractInfo?.label || untaggedSymbolMeta.Unknown.name,
    logo: marketingInfo?.logo?.url || untaggedSymbolMeta.Unknown.logo,
    symbol: tokenInfo?.symbol || untaggedSymbolMeta.Unknown.symbol,
    decimals: tokenInfo?.decimals || untaggedSymbolMeta.Unknown.decimals,
    coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
    denom: '',
    address: cw20ContractSource.address,
    tokenType: TokenType.Cw20,
    tokenVerification: TokenVerification.Unverified
  }
}

export const fetchCw20FactoryToken = async (
  denom: string,
  network: Network
) => {
  const bankMetadata = getBankTokenFactoryMetadataByAddress(denom, network)

  if (!bankMetadata) {
    return
  }

  const address = denom.split('/').pop()

  if (!address) {
    return
  }

  const cw20ContractSource = await fetchContractDetails(address, network)

  return formatCw20FactoryToken({
    address,
    bankMetadata,
    cw20ContractSource
  })
}

export const fetchCw20Token = async (denom: string, network: Network) => {
  try {
    const address = isCw20ContractAddress(denom)
      ? denom
      : denom.split('/').pop()

    if (!address || isDevnet(network) || !isCw20ContractAddress(address)) {
      return
    }

    const cw20ContractSource = await fetchContractDetails(address, network)

    if (cw20ContractSource) {
      return { ...formatCw20Token(cw20ContractSource), denom }
    }

    const formattedToken = { ...formatCw20Token(cw20ContractSource), denom }

    return formattedToken
  } catch (e) {
    console.log(`Error fetching cw20 contract state ${network} ${denom}:`, e)
  }
}
