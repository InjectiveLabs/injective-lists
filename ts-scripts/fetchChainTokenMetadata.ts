import { writeFile } from 'node:fs'
import {
  Network,
  isDevnet,
  isTestnet,
  getNetworkEndpoints,
  getCw20AdapterContractForNetwork
} from '@injectivelabs/networks'
import { HttpRestClient } from '@injectivelabs/utils'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { symbolMeta } from './data/symbolMeta'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { getNetworkFileName } from './helper/utils'
import {
  Coin,
  Token,
  Metadata,
  InsuranceFund,
  ExplorerPagination,
  ExplorerCw20Contract
} from './types'

/*
  fetch and cache bank metadata & supply token denoms
*/

const LIMIT = 5000

const formatMetadata = (metadata: Metadata) => {
  return {
    logo: metadata.uri,
    name: metadata.name,
    denom: metadata.base,
    symbol: metadata.symbol,
    display: metadata.display,
    description: metadata.description,
    decimals: metadata.denom_units.pop()?.exponent || 0
  }
}

const formatCw20Contract = (
  contract: ExplorerCw20Contract,
  network: Network
) => {
  const tokenInfo = contract.cw20_metadata?.token_info

  const adapterContractAddress = getCw20AdapterContractForNetwork(network)

  return {
    ...untaggedSymbolMeta.Unknown,
    name: tokenInfo?.name || contract.label || untaggedSymbolMeta.Unknown.name,
    denom: `factory/${adapterContractAddress}/${contract.address}`,
    creator: contract.creator,
    address: contract.address,
    decimals: tokenInfo?.decimals || untaggedSymbolMeta.Unknown.decimals,
    symbol:
      tokenInfo?.symbol || tokenInfo?.name || untaggedSymbolMeta.Unknown.symbol,
    tokenType: TokenType.Cw20,
    tokenVerification: TokenVerification.Internal
  }
}

const formatInsuranceFund = (insuranceFund: InsuranceFund): Token => {
  const denom = insuranceFund.insurance_pool_token_denom

  return {
    denom,
    decimals: 18,
    coinGeckoId: '',
    symbol: denom,
    logo: symbolMeta.INJ.logo,
    tokenType: TokenType.InsuranceFund,
    tokenVerification: TokenVerification.Verified,
    name: `${insuranceFund.market_ticker} Insurance Fund`
  }
}

export const fetchBankMetadata = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const bankApi = new HttpRestClient(`${endpoints.rest}/cosmos/bank/v1beta1/`, {
    timeout: 20000
  })

  try {
    const response = (await bankApi.get(
      `denoms_metadata?pagination.limit=${LIMIT}`
    )) as {
      data: { metadatas: Metadata[] }
    }

    // cache data in case of api error
    const data = JSON.stringify(
      response.data.metadatas
        .map(formatMetadata)
        .sort((a, b) => a.denom.localeCompare(b.denom)),
      null,
      2
    )

    writeFile(
      `./../tokens/bankMetadata/${getNetworkFileName(network)}.json`,
      data,
      (err) => {
        if (err) {
          console.error(`Error writing bank metadata ${network}:`, err)
        } else {
          console.log(`✅✅✅ fetchBankMetadata ${network}`)
        }
      }
    )
  } catch (e) {
    console.log(`Error fetching bank metadata ${network}:`, e)
  }
}

export const fetchSupplyDenoms = async (network: Network) => {
  try {
    const endpoints = getNetworkEndpoints(network)
    const bankApi = new HttpRestClient(
      `${endpoints.rest}/cosmos/bank/v1beta1/`,
      {
        timeout: 20000
      }
    )
    const response = (await bankApi.get(
      `supply?pagination.limit=${LIMIT}`
    )) as {
      data: { supply: Coin[] }
    }

    // cache data in case of api error
    const data = JSON.stringify(
      response.data.supply
        .map(({ denom }) => denom)
        .sort((a, b) => a.localeCompare(b)),
      null,
      2
    )

    writeFile(
      `./../tokens/bankSupplyDenoms/${getNetworkFileName(network)}.json`,
      data,
      (err) => {
        if (err) {
          console.error(`Error writing bank supply ${network}:`, err)
        } else {
          console.log(`✅✅✅ fetchSupplyDenoms ${network}`)
        }
      }
    )
  } catch (e) {
    console.log(`Error fetching bank supply ${network}:`, e)
  }
}

export const fetchCw20ContractInfo = async (network: Network) => {
  if (isDevnet(network)) {
    return
  }

  const codeIds = isTestnet(network) ? [25] : ['28', '5', '42']

  const cw20contracts: Token[] = []

  try {
    // todo: refactor after bumping injective-ts/networks (mainnet sentry explorer endpoint)
    const endpoint = isTestnet(network)
      ? getNetworkEndpoints(network).explorer
      : 'https://sentry.explorer.grpc-web.injective.network/'

    const explorerApi = new HttpRestClient(
      `${endpoint}/api/explorer/v1/wasm/`,
      {
        timeout: 20000
      }
    )

    for (const codeId of codeIds) {
      let {
        data: { paging, data }
      } = (await explorerApi.get('contracts', {
        code_id: codeId,
        limit: 100
      })) as {
        data: { paging: ExplorerPagination; data: ExplorerCw20Contract[] }
      }

      cw20contracts.push(
        ...data.map((contract) => formatCw20Contract(contract, network))
      )

      while (paging.to < paging.total) {
        const response = (await explorerApi.get('contracts', {
          code_id: codeId,
          limit: 100,
          skip: paging.to
        })) as {
          data: { paging: ExplorerPagination; data: ExplorerCw20Contract[] }
        }

        cw20contracts.push(
          ...response.data.data.map((contract) =>
            formatCw20Contract(contract, network)
          )
        )

        paging = response.data.paging
      }
    }

    const data = JSON.stringify(
      cw20contracts.sort((a, b) => a.denom.localeCompare(b.denom)),
      null,
      2
    )

    // cache data in case of api error
    writeFile(
      `./../tokens/cw20TokenMeta/${getNetworkFileName(network)}.json`,
      data,
      (err) => {
        if (err) {
          console.error(`Error writing cw20 contracts info ${network}:`, err)
        } else {
          console.log(`✅✅✅ fetchCw20ContractInfo ${network}`)
        }
      }
    )
  } catch (e) {
    console.log(`Error fetching cw20 contracts info ${network}:`, e)
  }
}

export const fetchInsuranceFunds = async (network: Network) => {
  const endpoints = getNetworkEndpoints(network)
  const insuranceApi = new HttpRestClient(
    `${endpoints.rest}/injective/insurance/v1beta1/`,
    {
      timeout: 20000
    }
  )

  try {
    const response = (await insuranceApi.get('insurance_funds')) as {
      data: { funds: InsuranceFund[] }
    }

    // cache data in case of api error
    const data = JSON.stringify(
      response.data.funds
        .map(formatInsuranceFund)
        .sort((a, b) => a.denom.localeCompare(b.denom)),
      null,
      2
    )

    writeFile(
      `./../tokens/insuranceFunds/${getNetworkFileName(network)}.json`,
      data,
      (err) => {
        if (err) {
          console.error(`Error writing insurance funds ${network}:`, err)
        } else {
          console.log(`✅✅✅ fetchInsuranceFunds ${network}`)
        }
      }
    )
  } catch (e) {
    console.log(`Error fetching insurance funds ${network}:`, e)
  }
}

fetchBankMetadata(Network.Devnet)
fetchBankMetadata(Network.TestnetSentry)
fetchBankMetadata(Network.MainnetSentry)
fetchSupplyDenoms(Network.Devnet)
fetchSupplyDenoms(Network.TestnetSentry)
fetchSupplyDenoms(Network.MainnetSentry)
fetchCw20ContractInfo(Network.TestnetSentry)
fetchCw20ContractInfo(Network.MainnetSentry)
fetchInsuranceFunds(Network.Devnet)
fetchInsuranceFunds(Network.TestnetSentry)
fetchInsuranceFunds(Network.MainnetSentry)
