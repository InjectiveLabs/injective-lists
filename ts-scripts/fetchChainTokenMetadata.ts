import {
  Network,
  getNetworkEndpoints,
  CW20_ADAPTER_CONTRACT_BY_NETWORK
} from '@injectivelabs/networks'
import {
  Metadata,
  Validator,
  TokenType,
  InsuranceFund,
  ChainGrpcBankApi,
  TokenVerification,
  IndexerGrpcSpotApi,
  ChainGrpcStakingApi,
  isCw20ContractAddress,
  ChainGrpcTokenFactoryApi,
  ChainGrpcInsuranceFundApi,
  IndexerGrpcDerivativesApi
} from '@injectivelabs/sdk-ts'
import { symbolMeta } from './data/symbolMeta'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { Token } from './types'

const LIMIT = 10000

const formatMetadata = (metadata: Metadata) => {
  const denom = metadata.base
  const name = denom.startsWith('factory')
    ? [...denom.split('/')].pop() || denom
    : denom

  return {
    name,
    denom,
    address: isCw20ContractAddress(name) ? name : denom,
    logo: metadata.uri,
    symbol: metadata.symbol,
    display: metadata.display,
    description: metadata.description,
    decimals:
      metadata.denomUnits.pop()?.exponent || untaggedSymbolMeta.Unknown.decimals
  }
}

const formatInsuranceFund = (insuranceFund: InsuranceFund): Token => {
  const denom = insuranceFund.insurancePoolTokenDenom

  return {
    denom,
    decimals: 18,
    coinGeckoId: '',
    symbol: denom,
    address: denom,
    logo: symbolMeta.INJ.logo,
    tokenType: TokenType.InsuranceFund,
    tokenVerification: TokenVerification.Internal,
    name: `${insuranceFund.marketTicker} Insurance Fund`
  }
}

export const fetchBankMetadata = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const bankApi = new ChainGrpcBankApi(endpoints.grpc)

  try {
    const response = await bankApi.fetchDenomsMetadata({ limit: LIMIT })

    // cache data in case of api error
    await updateJSONFile(
      `data/bankMetadata/${getNetworkFileName(network)}.json`,
      response.metadatas
        .map(formatMetadata)
        .sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ fetchBankMetadata ${network}`)
  } catch (e) {
    console.log(`Error fetching bank metadata ${network}:`, e)
  }
}

export const fetchSupplyDenoms = async (network: Network) => {
  try {
    const endpoints = getNetworkEndpoints(network)
    const bankApi = new ChainGrpcBankApi(endpoints.grpc)

    const response = await bankApi.fetchAllTotalSupply()

    const existingSupplyDenoms = await readJSONFile({
      path: `data/bankSupplyDenoms/${getNetworkFileName(network)}.json`
    })

    const denoms = [
      ...new Set([
        ...existingSupplyDenoms,
        ...response.supply.map(({ denom }) => denom)
      ])
    ]

    // cache data in case of api error
    await updateJSONFile(
      `data/bankSupplyDenoms/${getNetworkFileName(network)}.json`,
      denoms.sort((a, b) => a.localeCompare(b))
    )

    console.log(`✅✅✅ fetchSupplyDenoms ${network}`)
  } catch (e) {
    console.log(`Error fetching bank supply ${network}:`, e)
  }
}

export const fetchInsuranceFunds = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const insuranceApi = new ChainGrpcInsuranceFundApi(endpoints.grpc)

  try {
    const response = await insuranceApi.fetchInsuranceFunds()

    // cache data in case of api error
    await updateJSONFile(
      `data/insuranceFunds/${getNetworkFileName(network)}.json`,
      response
        .map(formatInsuranceFund)
        .sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ fetchInsuranceFunds ${network}`)
  } catch (e) {
    console.log(`Error fetching insurance funds ${network}:`, e)
  }
}

export const fetchValidators = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const chainGrpcStakingApi = new ChainGrpcStakingApi(endpoints.grpc)

  try {
    const { validators } = await chainGrpcStakingApi.fetchValidators({
      limit: LIMIT
    })

    // cache data in case of api error
    await updateJSONFile(
      `data/validators/${getNetworkFileName(network)}.json`,
      validators.sort((a: Validator, b: Validator) =>
        a.operatorAddress.localeCompare(b.operatorAddress)
      )
    )

    console.log(`✅✅✅ fetchValidators ${network}`)
  } catch (e) {
    console.log(`Error fetching validators ${network} using cached data:`, e)
  }
}

export const fetchTokenCw20Denoms = async (network: Network) => {
  const contractAddress = CW20_ADAPTER_CONTRACT_BY_NETWORK[network]

  const endpoints = getNetworkEndpoints(network)
  const tokenFactoryApi = new ChainGrpcTokenFactoryApi(endpoints.grpc)

  try {
    const denoms = await tokenFactoryApi.fetchDenomsFromCreator(contractAddress)

    await updateJSONFile(
      `data/cw20Denoms/${getNetworkFileName(network)}.json`,
      denoms.sort((a, b) => a.localeCompare(b))
    )

    console.log(`✅✅✅ fetchTokenCw20Denoms ${network}`)
  } catch (e) {
    console.log(`Error fetching token cw20 denoms ${network}:`, e)
  }
}

export const fetchSpotMarkets = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const indexerSpotApi = new IndexerGrpcSpotApi(endpoints.indexer)

  try {
    const markets = await indexerSpotApi.fetchMarkets()

    await updateJSONFile(
      `data/market/spot/${getNetworkFileName(network)}.json`,
      markets.sort((a, b) => a.marketId.localeCompare(b.marketId))
    )

    console.log(`✅✅✅ fetchSpotMarkets ${network}`)
  } catch (e) {
    console.log(`Error fetching spot market ${network}:`, e)
  }
}

export const fetchDerivativeMarkets = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const indexerDerivativeApi = new IndexerGrpcDerivativesApi(endpoints.indexer)

  try {
    const markets = await indexerDerivativeApi.fetchMarkets()

    await updateJSONFile(
      `data/market/derivative/${getNetworkFileName(network)}.json`,
      markets.sort((a, b) => a.marketId.localeCompare(b.marketId))
    )

    console.log(`✅✅✅ fetchDerivativeMarkets ${network}`)
  } catch (e) {
    console.log(`Error fetching derivative market ${network}:`, e)
  }
}

fetchBankMetadata(Network.Devnet)
fetchBankMetadata(Network.TestnetSentry)
fetchBankMetadata(Network.MainnetSentry)
fetchSupplyDenoms(Network.Devnet)
fetchSupplyDenoms(Network.TestnetSentry)
fetchSupplyDenoms(Network.MainnetSentry)
fetchInsuranceFunds(Network.Devnet)
fetchInsuranceFunds(Network.TestnetSentry)
fetchInsuranceFunds(Network.MainnetSentry)
fetchValidators(Network.Devnet)
fetchValidators(Network.TestnetSentry)
fetchValidators(Network.MainnetSentry)
fetchTokenCw20Denoms(Network.Devnet)
fetchTokenCw20Denoms(Network.TestnetSentry)
fetchTokenCw20Denoms(Network.MainnetSentry)
fetchSpotMarkets(Network.Devnet)
fetchSpotMarkets(Network.TestnetSentry)
fetchSpotMarkets(Network.MainnetSentry)
fetchDerivativeMarkets(Network.Devnet)
fetchDerivativeMarkets(Network.TestnetSentry)
fetchDerivativeMarkets(Network.MainnetSentry)
