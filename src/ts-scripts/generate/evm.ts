import { EvmChainId } from '@injectivelabs/ts-types'
import {
  Network,
  isMainnet,
  isTestnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import { ChainGrpcErc20Api } from '@injectivelabs/sdk-ts'
import { readJSONFile, tokensToDenomMap } from '../helper/utils'
import type { TokenStatic } from '@injectivelabs/sdk-ts'
import type { Token } from '../../types'

// module '/Users/leeruianthomas/Public/injective/injective-lists/src/ts-scripts/node_modules/@injectivelabs/sdk-ts/dist/cjs/index'

// module '/Users/leeruianthomas/Public/injective/injective-lists/src/node_modules/.pnpm/@injectivelabs+sdk-ts@1.16.17_bufferutil@4.0.9_typescript@5.9.3_utf-8-validate@5.0.10/node_modules/@injectivelabs/sdk-ts/dist/cjs/index'

const devnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/devnet.json'
  })
)
const testnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/testnet.json'
  })
)
const mainnetTokensMap = tokensToDenomMap(
  readJSONFile({
    path: 'json/tokens/mainnet.json'
  })
)

function getEvmChainId(network: Network) {
  if (isMainnet(Network.MainnetSentry)) {
    return EvmChainId.MainnetEvm
  }

  if (isTestnet(network)) {
    return EvmChainId.TestnetEvm
  }

  return EvmChainId.DevnetEvm
}

function formatToEvmToken({
  token,
  network,
  evmAddress
}: {
  token: Token
  network: Network
  evmAddress: string
}) {
  return {
    name: token.name,
    address: evmAddress,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId: getEvmChainId(network),
    logoUri: token.logo
  }
}

async function fetchAllMTSPairs(network: Network) {
  const endpoints = getNetworkEndpoints(network)
  const erc20Api = new ChainGrpcErc20Api(endpoints.grpc)

  let tokenMap = devnetTokensMap

  if (isTestnet(network)) {
    tokenMap = testnetTokensMap
  }

  if (isMainnet(network)) {
    tokenMap = mainnetTokensMap
  }

  try {
    const response = await erc20Api.fetchAllTokenPairsWithPagination()

    // console.log(testnetTokensMap)

    response.tokenPairs.forEach((tokenPair) => {
      const tokenMetadata = tokenMap[tokenPair.bankDenom.toLowerCase()]
      const evmTokenMetadata = formatToEvmToken({
        network,
        token: tokenMetadata,
        evmAddress: tokenPair.erc20Address
      })

      console.log(evmTokenMetadata)
    })

    // const combinedMetadatas = [...allMetadatas, ...response.metadatas]

    // if (response.metadatas.length === LIMIT) {
    //   return fetchAllDenomsMetadata({
    //     network,
    //     offset: offset + LIMIT,
    //     allMetadatas: combinedMetadatas
    //   })
    // }

    // return combinedMetadatas
  } catch (error) {
    console.error('Error fetching MTS pairs:', error)
    throw error // Or handle the error as appropriate for your use case
  }
}

fetchAllMTSPairs(Network.TestnetSentry)
