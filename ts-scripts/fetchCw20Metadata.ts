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
  getNetworkEndpoints
} from '@injectivelabs/networks'
import {
  TokenStatic,
  TokenType,
  TokenVerification
} from '@injectivelabs/token-metadata'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { getCw20TokenMetadata } from './helper/getter'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { Cw20ContractSource, BankMetadata } from './types'

const mainnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.MainnetSentry).grpc
)

const testnetWasmApi = new ChainGrpcWasmApi(
  getNetworkEndpoints(Network.TestnetSentry).grpc
)

const formatCw20FactoryToken = ({
  address,
  tokenInfo,
  marketingInfo,
  bankMetaData
}: {
  address: string
  tokenInfo: TokenInfo
  bankMetaData: BankMetadata
  marketingInfo?: MarketingInfo
}): TokenStatic => {
  return {
    coinGeckoId: '',
    address,
    name: tokenInfo.name || bankMetaData.name,
    denom: bankMetaData.denom,
    decimals: bankMetaData.decimals || tokenInfo.decimals,
    logo: untaggedSymbolMeta.Unknown.logo,
    symbol:
      tokenInfo.symbol ||
      bankMetaData.symbol ||
      untaggedSymbolMeta.Unknown.symbol,
    externalLogo: marketingInfo?.logo?.url || untaggedSymbolMeta.Unknown.logo,
    tokenType: TokenType.TokenFactory,
    tokenVerification: TokenVerification.Internal
  }
}

const formatCW20Token = ({
  address,
  tokenInfo,
  contractInfo,
  marketingInfo
}: {
  address: string
  tokenInfo: TokenInfo
  marketingInfo?: MarketingInfo
  contractInfo: ContractInfo
}): Cw20ContractSource => {
  return {
    name:
      tokenInfo.name || contractInfo.label || untaggedSymbolMeta.Unknown.name,
    logo: marketingInfo?.logo?.url || untaggedSymbolMeta.Unknown.logo,
    symbol: tokenInfo?.symbol || untaggedSymbolMeta.Unknown.symbol,
    decimals: tokenInfo.decimals,
    coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
    denom: address,
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

    const bankCw20FactoryToken = getCw20TokenMetadata(
      address,
      Network.MainnetSentry
    )

    const cachedCw20FactoryToken =
      existingCW20TokensMap[(bankCw20FactoryToken?.denom || '').toLowerCase()]
    const cachedCw20Token = existingCW20TokensMap[denom.toLowerCase()]

    // if (cachedCw20Token && !bankCw20FactoryToken) {
    //   return [cachedCw20Token]
    // }

    // if (cachedCw20Token && cachedCw20FactoryToken) {
    //   return [cachedCw20Token, cachedCw20FactoryToken]
    // }

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

    let formattedCw20FactoryToken = undefined
    const formattedToken = formatCW20Token({
      address,
      contractInfo: contractInfoResponse,
      tokenInfo: contractStateResponse.tokenInfo,
      marketingInfo: contractStateResponse.marketingInfo
    })

    const updateMap = {
      ...existingCW20TokensMap,
      [address.toLowerCase()]: formattedToken
    }

    if (bankCw20FactoryToken) {
      formattedCw20FactoryToken = formatCw20FactoryToken({
        address,
        bankMetaData: bankCw20FactoryToken,
        tokenInfo: contractStateResponse.tokenInfo,
        marketingInfo: contractStateResponse.marketingInfo
      })

      updateMap[formattedCw20FactoryToken.address.toLowerCase()] =
        formattedCw20FactoryToken
    }

    await updateJSONFile(
      `tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
      updateMap
    )

    return [formattedToken, formattedCw20FactoryToken].filter((token) => token)
  } catch (e) {
    console.log(`Error fetching cw20 contract state ${network} ${denom}:`, e)
  }
}
