import { Network } from '@injectivelabs/networks'
import { getNetworkFileName, readJSONFile } from './helper/utils'
import { Token } from './types'

function checkForDuplicate(network: Network) {
  const path = `tokens/${getNetworkFileName(network)}.json`

  const data = readJSONFile({ path })

  const tokensByDenom = data.reduce(
    (list: Record<string, any>, token: Token) => {
      const denom = token.denom

      if (list[denom]) {
        return {
          ...list,
          [denom]: {
            list: [...list[denom].list, token],
            count: list[denom].count + 1
          }
        }
      }

      return { ...list, [denom]: { list: [token], count: 1 } }
    },
    {}
  )

  const duplicates = Object.entries(tokensByDenom).filter(([_, item]) => {
    return (item as { count: number; list: Token[] }).count > 1
  })

  if (duplicates.length < 0) {
    console.log(`Duplicates found on: ${path}`)
    console.log(duplicates)

    return
  }

  console.log(`No duplicates found on: ${path}`)
}

checkForDuplicate(Network.Devnet)
checkForDuplicate(Network.TestnetSentry)
checkForDuplicate(Network.MainnetSentry)
