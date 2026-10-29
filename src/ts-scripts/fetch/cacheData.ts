import {
  Address,
  Metadata,
  TokenType,
  SpotMarket,
  InsuranceFund,
  ChainGrpcBankApi,
  DerivativeMarket,
  TokenVerification,
  IndexerGrpcSpotApi,
  ChainGrpcStakingApi,
  isCw20ContractAddress,
  ChainGrpcTokenFactoryApi,
  ChainGrpcInsuranceFundApi,
  IndexerGrpcDerivativesApi
} from '@injectivelabs/sdk-ts'
import {
  Network,
  isMainnet,
  getNetworkEndpoints,
  getCw20AdapterContractForNetwork
} from '@injectivelabs/networks'
import {
  uint8ArrayToHex,
  base64ToUint8Array,
  BECH32_ADDR_CONS_PREFIX,
  sha256
} from '@injectivelabs/sdk-ts'
import {
  isDenom,
  denomsToDenomMap,
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../helper/utils'
import { symbolMeta } from '../../data/tokens/symbolMeta'
import { untaggedSymbolMeta } from '../../data/tokens/untaggedSymbolMeta'
import { Token, BankMetadata } from '../../types'
import { pathToFileURL } from 'node:url'
import { devnetHardcodedCw20Denoms } from '../../data/tokens/cw20'
import {
  getCuratedBankDenoms,
  filterCuratedCw20Denoms
} from '../helper/staticTokenSources'

const LIMIT = 10000

async function fetchAllDenomsMetadata({
  offset = 0,
  network,
  allMetadatas = []
}: {
  offset?: number
  network: Network
  allMetadatas?: any[]
}) {
  const endpoints = getNetworkEndpoints(network)
  const bankApi = new ChainGrpcBankApi(endpoints.grpc)

  try {
    const response = await bankApi.fetchDenomsMetadata({ limit: LIMIT, offset })

    const combinedMetadatas = [...allMetadatas, ...response.metadatas]

    if (response.metadatas.length === LIMIT) {
      return fetchAllDenomsMetadata({
        network,
        offset: offset + LIMIT,
        allMetadatas: combinedMetadatas
      })
    }

    return combinedMetadatas
  } catch (error) {
    console.error('Error fetching denoms metadata:', error)
    throw error // Or handle the error as appropriate for your use case
  }
}

const formatMetadata = (metadata: Metadata) => {
  const denom = metadata.base
  const formattedName = denom.startsWith('factory')
    ? [...denom.split('/')].pop() || denom
    : denom

  const name =
    [metadata.name, metadata.display, formattedName].filter(
      (value) => !isDenom(value)
    )?.[0] || formattedName

  return {
    name,
    denom,
    address: isCw20ContractAddress(name) ? name : denom,
    logo: metadata.uri,
    symbol: metadata.symbol,
    display: metadata.display,
    description: metadata.description,
    decimals:
      metadata.denomUnits[metadata.denomUnits.length - 1]?.exponent ??
      untaggedSymbolMeta.Unknown.decimals
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
    tokenVerification: TokenVerification.Verified,
    name: `${insuranceFund.marketTicker} Insurance Fund`
  }
}

export const fetchBankMetadata = async (network: Network) => {
  if (!isMainnet(network)) {
    const path = `src/cache/bankMetadata/${getNetworkFileName(network)}.json`
    const cached = new Map<string, BankMetadata>(
      readJSONFile({ path }).map((token: BankMetadata) => [
        token.denom, token
      ])
    )
    const bankApi = new ChainGrpcBankApi(getNetworkEndpoints(network).grpc)
    const metadatas: BankMetadata[] = []

    const approvedDenoms = getCuratedMappingDenoms(network)
    for (let i = 0; i < approvedDenoms.length; i += 10) {
      await Promise.all(approvedDenoms.slice(i, i + 10).map(async (denom) => {
        try {
          const metadata = await bankApi.fetchDenomMetadata(denom)
          if (metadata?.base === denom) {
            metadatas.push(formatMetadata(metadata))
            return
          }
        } catch {
          // Optional chain metadata falls back to approved cached or static metadata.
        }

        const previous = cached.get(denom)
        if (previous) metadatas.push(previous)
      }))
    }

    updateJSONFile(
      path,
      metadatas.sort((a, b) => a.denom.localeCompare(b.denom))
    )
    return
  }

  try {
    const metadatas = await fetchAllDenomsMetadata({
      network
    })

    // cache data in case of api error
    await updateJSONFile(
      `src/cache/bankMetadata/${getNetworkFileName(network)}.json`,
      metadatas
        .map(formatMetadata)
        .sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ fetchBankMetadata ${network}`)
  } catch (e) {
    console.log(`Error fetching bank metadata ${network}:`, e)
  }
}

export const fetchSupplyDenoms = async (network: Network) => {
  if (!isMainnet(network)) {
    const bankApi = new ChainGrpcBankApi(getNetworkEndpoints(network).grpc)
    const path = `src/cache/bankSupplyDenoms/${getNetworkFileName(network)}.json`
    const cached: string[] = readJSONFile({ path })
    const denoms: string[] = []

    const approvedDenoms = getCuratedMappingDenoms(network)
    for (let i = 0; i < approvedDenoms.length; i += 10) {
      await Promise.all(approvedDenoms.slice(i, i + 10).map(async (denom) => {
        try {
          const supply = await bankApi.fetchSupplyOf(denom)
          if (supply?.denom === denom) {
            denoms.push(supply.denom)
            return
          }
        } catch {
          // Keep only previously approved casing when this lookup is unavailable.
        }

        if (cached.includes(denom)) denoms.push(denom)
      }))
    }

    updateJSONFile(
      path,
      [...new Set(denoms)].sort((a, b) => a.localeCompare(b))
    )
    return
  }

  try {
    const endpoints = getNetworkEndpoints(network)
    const bankApi = new ChainGrpcBankApi(endpoints.grpc)

    const response = await bankApi.fetchAllTotalSupply()

    const existingSupplyDenoms = await readJSONFile({
      path: `src/cache/bankSupplyDenoms/${getNetworkFileName(network)}.json`
    })

    const denoms = [
      ...new Set([
        ...existingSupplyDenoms,
        ...response.supply.map(({ denom }) => denom)
      ])
    ]

    // cache data in case of api error
    await updateJSONFile(
      `src/cache/bankSupplyDenoms/${getNetworkFileName(network)}.json`,
      denoms.sort((a, b) => a.localeCompare(b))
    )

    console.log(`✅✅✅ fetchSupplyDenoms ${network}`)
  } catch (e) {
    console.log(`Error fetching bank supply ${network}:`, e)
  }
}

export const fetchInsuranceFunds = async (network: Network) => {
  if (!isMainnet(network)) return

  const endpoints = getNetworkEndpoints(network)
  const insuranceApi = new ChainGrpcInsuranceFundApi(endpoints.grpc)

  try {
    const response = await insuranceApi.fetchInsuranceFunds()

    // cache data in case of api error
    await updateJSONFile(
      `src/cache/insuranceFunds/${getNetworkFileName(network)}.json`,
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

    const formattedValidators = validators.map((validator) => {
      if (!validator.consensusPubKey) {
        return { ...validator, valconsAddress: '' }
      }

      const pubKeyBytes = base64ToUint8Array(validator.consensusPubKey)
      const addressBytes = sha256(pubKeyBytes).slice(0, 20)
      const addressHex = uint8ArrayToHex(addressBytes)

      const valconsAddress = Address.fromHex(
        addressHex,
        BECH32_ADDR_CONS_PREFIX
      ).bech32Address

      return { ...validator, valconsAddress }
    })

    // cache data in case of api error
    await updateJSONFile(
      `src/cache/validators/${getNetworkFileName(network)}.json`,
      formattedValidators.sort((a: any, b: any) =>
        a.operatorAddress.localeCompare(b.operatorAddress)
      )
    )

    console.log(`✅✅✅ fetchValidators ${network}`)
  } catch (e) {
    console.log(`Error fetching validators ${network} using cached data:`, e)
  }
}

export const fetchTokenCw20Denoms = async (network: Network) => {
  const contractAddress = getCw20AdapterContractForNetwork(network)

  const endpoints = getNetworkEndpoints(network)
  const tokenFactoryApi = new ChainGrpcTokenFactoryApi(endpoints.grpc)

  try {
    const denoms = await tokenFactoryApi.fetchDenomsFromCreator(contractAddress)

    await updateJSONFile(
      `src/cache/cw20Denoms/${getNetworkFileName(network)}.json`,
      isMainnet(network)
        ? denoms.sort((a, b) => a.localeCompare(b))
        : filterCuratedCw20Denoms(denoms, network)
    )

    console.log(`✅✅✅ fetchTokenCw20Denoms ${network}`)
  } catch (e) {
    console.log(`Error fetching token cw20 denoms ${network}:`, e)
    if (!isMainnet(network)) {
      const path = `src/cache/cw20Denoms/${getNetworkFileName(network)}.json`
      updateJSONFile(path, filterCuratedCw20Denoms(readJSONFile({ path }), network))
    }
  }
}

const getCuratedMappingDenoms = (network: Network) => {
  const name = getNetworkFileName(network)
  const cw20Denoms = readJSONFile({
    path: `src/cache/cw20Denoms/${name}.json`
  })
  const supplyDenoms: string[] = readJSONFile({
    path: `src/cache/bankSupplyDenoms/${name}.json`
  })
  const casing = denomsToDenomMap(supplyDenoms)

  return getCuratedBankDenoms(network, [
    ...cw20Denoms,
    ...(network === Network.Devnet ? devnetHardcodedCw20Denoms : [])
  ]).map(denom => casing[denom.toLowerCase()] || denom)
}

export const fetchCuratedTokenMappings = async (network: Network) => {
  await fetchTokenCw20Denoms(network)
  await fetchSupplyDenoms(network)
  await fetchBankMetadata(network)
}

export const fetchSpotMarkets = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const indexerSpotApi = new IndexerGrpcSpotApi(endpoints.indexer)

  try {
    const markets = (await indexerSpotApi.fetchMarkets({
      marketStatuses: ['active', 'paused', 'suspended', 'demolished', 'expired']
    })) as SpotMarket[]

    const formattedMarkets = markets.map((market: any) => {
      if (market.baseToken) {
        const { updatedAt: baseUpdatedAt, ...restOfBaseToken } =
          market.baseToken

        market.baseToken = restOfBaseToken
      }

      if (market.quoteToken) {
        const { updatedAt: quoteUpdatedAt, ...restOfQuoteToken } =
          market.quoteToken

        market.quoteToken = restOfQuoteToken
      }

      return market
    })

    await updateJSONFile(
      `src/cache/market/spot/${getNetworkFileName(network)}.json`,
      formattedMarkets.sort((a, b) => a.marketId.localeCompare(b.marketId))
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
    const markets = (await indexerDerivativeApi.fetchMarkets({
      marketStatuses: ['active', 'paused', 'suspended', 'demolished', 'expired']
    })) as DerivativeMarket[]

    const formattedMarkets = markets.map((market: any) => {
      const {
        perpetualMarketInfo,
        nextFundingTimestamp,
        perpetualMarketFunding,
        ...restOfMarket
      } = market

      const { updatedAt, ...restOfQuoteToken } = market.quoteToken

      return { ...restOfMarket, quoteToken: restOfQuoteToken }
    })

    await updateJSONFile(
      `src/cache/market/derivative/${getNetworkFileName(network)}.json`,
      formattedMarkets.sort((a, b) => a.marketId.localeCompare(b.marketId))
    )

    console.log(`✅✅✅ fetchDerivativeMarkets ${network}`)
  } catch (e) {
    console.log(`Error fetching derivative market ${network}:`, e)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchCuratedTokenMappings(Network.Devnet)
  fetchCuratedTokenMappings(Network.TestnetSentry)
  fetchBankMetadata(Network.MainnetSentry)
  fetchSupplyDenoms(Network.MainnetSentry)
  fetchInsuranceFunds(Network.MainnetSentry)
  fetchValidators(Network.Devnet)
  fetchValidators(Network.TestnetSentry)
  fetchValidators(Network.MainnetSentry)
  fetchTokenCw20Denoms(Network.MainnetSentry)
  fetchSpotMarkets(Network.Devnet)
  fetchSpotMarkets(Network.TestnetSentry)
  fetchSpotMarkets(Network.MainnetSentry)
  fetchDerivativeMarkets(Network.Devnet)
  fetchDerivativeMarkets(Network.TestnetSentry)
  fetchDerivativeMarkets(Network.MainnetSentry)
}
