import {
  TokenStatic,
  TokenType,
  ChainGrpcIbcApi,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import {
  Network,
  isMainnet,
  getNetworkEndpoints
} from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { IbcDenomTrace } from './types'

const mainnetIbcApi = new ChainGrpcIbcApi(
  getNetworkEndpoints(Network.MainnetSentry).grpc
)

const testnetIbcApi = new ChainGrpcIbcApi(
  getNetworkEndpoints(Network.TestnetSentry).grpc
)

export const formatIbcToken = ({
  denom,
  denomTrace
}: {
  denom: string
  denomTrace?: IbcDenomTrace
}): TokenStatic => ({
  hash: denom.replace('ibc/', ''),
  denom,
  address: denom,
  path: denomTrace?.path || '',
  baseDenom: denomTrace?.baseDenom || untaggedSymbolMeta.Unknown.symbol,
  channelId: denomTrace?.channelId || '',
  name: untaggedSymbolMeta.Unknown.name,
  logo: untaggedSymbolMeta.Unknown.logo,
  coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
  decimals: untaggedSymbolMeta.Unknown.decimals,
  symbol: denomTrace?.baseDenom || untaggedSymbolMeta.Unknown.symbol,
  tokenType: TokenType.Ibc,
  tokenVerification: denomTrace
    ? TokenVerification.External
    : TokenVerification.Unverified
})

export const fetchIbcTokenMetaData = async (
  denom: string,
  network: Network
) => {
  if (!denom.startsWith('ibc')) {
    return
  }

  const path = `data/ibcDenomTrace/${getNetworkFileName(network)}.json`
  const existingIbcDenomTraceMap = readJSONFile({
    path,
    fallback: {}
  })

  const hash = denom.replace('ibc/', '')
  const existingIbcDenomTrace = existingIbcDenomTraceMap[hash.toLowerCase()]

  if (existingIbcDenomTrace) {
    return formatIbcToken({ denom, denomTrace: existingIbcDenomTrace })
  }

  const ibcApi = isMainnet(network) ? mainnetIbcApi : testnetIbcApi

  try {
    const denomTrace = await ibcApi.fetchDenomTrace(hash)

    if (!denomTrace) {
      return formatIbcToken({ denom })
    }

    const formattedDenomTrace = {
      path: denomTrace.path,
      baseDenom: denomTrace.baseDenom,
      channelId: denomTrace.path.split('/').pop() as string
    } as IbcDenomTrace

    await updateJSONFile(path, {
      ...existingIbcDenomTraceMap,
      [hash.toLowerCase()]: formattedDenomTrace
    })

    console.log(`✅ Uploaded ${network} ibc token denom trace for ${hash}`)

    return formatIbcToken({ denom, denomTrace: formattedDenomTrace })
  } catch (e) {
    await updateJSONFile(path, {
      ...existingIbcDenomTraceMap,
      [hash.toLowerCase()]: {
        path: '',
        baseDenom: '',
        channelId: ''
      }
    })

    console.log(`Error fetching ibc token metadata ${network} ${denom}:`, e)
  }
}
