import { IndexerRestExplorerApi } from '@injectivelabs/sdk-ts'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { readJSONFile, updateJSONFile } from '../helper/utils'
import { SwapRoute } from '../../types'

const TRANSACTION_HASHES = [
  '801B1258B8D0824EDB0A09F6673E61C93B44247749C780B9A6F00FED6D024748',
  'C9C9520422EB42CB8AED94491186D814D0641048AAE4C00412C3E7ABDA476E7C',
  '847A57D7EB00BEDF9361A69D5507469E14792A9D7CE35D0A44394E5183EA9045',
  '95BFF68D213A1410A8345A73BD9EAE89501B1B7DD880A7B70D1745E209DC9E04',
  'DD7C5EAD2E5B78D46677E18CA0EBE2BC23DAD4ADC15AF70A04E9AD801886F0BF',
  '0CE85C9D7F8FC59517F00F1091E12E4E1693E9C68CC4987D7B3C8E5B778ED7BE',
  '5569E74F76DD5A51705FBD186280898167137A95E59A6A903504ABCEC7C41CD0'
]

const fetchRoutesFromTx = async (
  transactionHash: string,
  network: Network
): Promise<SwapRoute[]> => {
  const endpoints = getNetworkEndpoints(network)
  const indexerRestExplorerApi = new IndexerRestExplorerApi(endpoints.indexer)

  const transaction = await indexerRestExplorerApi.fetchTransaction(
    transactionHash
  )

  if (!transaction || !transaction.messages) {
    return []
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

  return formattedRoutes
}

const getRouteKey = (route: SwapRoute) => {
  return `${route.source_denom}__${route.target_denom}__${route.steps.join(
    ','
  )}`
}

const main = async () => {
  const existingRoutes = readJSONFile({
    path: 'src/cache/formattedSwapRoutes.json',
    fallback: []
  }) as SwapRoute[]

  const routeMap = new Map<string, SwapRoute>()

  for (const route of existingRoutes) {
    routeMap.set(getRouteKey(route), route)
  }

  for (const hash of TRANSACTION_HASHES) {
    const routes = await fetchRoutesFromTx(hash, Network.MainnetSentry)

    for (const route of routes) {
      routeMap.set(getRouteKey(route), route)
    }
  }

  const combinedRoutes = Array.from(routeMap.values())

  await updateJSONFile('src/cache/formattedSwapRoutes.json', combinedRoutes)
}

main()
