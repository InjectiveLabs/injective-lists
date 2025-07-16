import { IndexerRestExplorerApi } from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { updateJSONFile } from '../helper/utils'
import { SwapRoute } from '../../types'

const TRANSACTION_HASH =
  '71F4667E43803A10163E72D0928C90AF7E18704FB6B2569906565DDBEE2261EB'

export const querySwapRoutesViaTransactionHash = async (
  transactionHash: string,
  network: Network
) => {
  const endpoints = getNetworkEndpoints(network)
  const indexerRestExplorerApi = new IndexerRestExplorerApi(endpoints.indexer)

  const transaction = await indexerRestExplorerApi.fetchTransaction(
    transactionHash
  )

  if (!transaction || !transaction.messages) {
    return
  }

  const msgExec = transaction.messages[0] as {
    message: {
      msgs: {
        msg: {
          set_route: {
            source_denom: string
            target_denom: string
            route: string[]
          }
        }
      }[]
    }
  }

  const formattedRoutes = msgExec.message.msgs.reduce((routes, msg) => {
    if (!msg.msg.set_route) {
      return routes
    }

    const {
      msg: { set_route }
    } = msg

    return [
      ...routes,
      {
        source_denom: set_route.source_denom,
        target_denom: set_route.target_denom,
        steps: set_route.route
      }
    ]
  }, [] as SwapRoute[])

  await updateJSONFile('src/cache/formattedSwapRoutes.json', formattedRoutes)
}

querySwapRoutesViaTransactionHash(TRANSACTION_HASH, Network.MainnetSentry)
