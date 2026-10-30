import { Network } from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

const flushCw20CacheData = async (network: Network) => {
  await updateJSONFile(
    `src/cache/cw20ContractSources/${getNetworkFileName(network)}.json`,
    {}
  )
}

flushCw20CacheData(Network.MainnetSentry)
