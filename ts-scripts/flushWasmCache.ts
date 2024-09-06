import { Network } from '@injectivelabs/networks'
import { updateJSONFile, getNetworkFileName } from './helper/utils'

const flushWasmCache = async (network: Network) => {
  await updateJSONFile(
    `data/wasm/codeIds/${getNetworkFileName(network)}.json`,
    []
  )

  await updateJSONFile(
    `wasm/query/${getNetworkFileName(network)}.json`,
    {}
  )

  await updateJSONFile(
    `wasm/execute/${getNetworkFileName(network)}.json`,
    {}
  )
}

flushWasmCache(Network.Devnet)
flushWasmCache(Network.TestnetSentry)
flushWasmCache(Network.MainnetSentry)
