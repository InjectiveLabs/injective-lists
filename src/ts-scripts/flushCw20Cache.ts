import { Network } from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

const flushCw20CacheData = async (network: Network) => {
  await updateJSONFile(
    `data/cw20ContractSources/${getNetworkFileName(network)}.json`,
    {}
  )
}

flushCw20CacheData(Network.Devnet)
flushCw20CacheData(Network.TestnetSentry)
flushCw20CacheData(Network.MainnetSentry)
