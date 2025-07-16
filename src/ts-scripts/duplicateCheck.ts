import { Network } from '@injectivelabs/networks'
import { getNetworkFileName, readJSONFile } from './helper/utils'
import { Token } from '../types'

function checkForDuplicate(network: Network) {
  const path = `tokens/${getNetworkFileName(network)}.json`

  const data = readJSONFile({ path })

  const tokensByDenom = data.reduce(
    (list: Record<string, any>, token: Token) => {
      const denom = token.denom

      if (denom in list) {
        list[denom].list.push(token)
        list[denom].count++
      } else {
        list[denom] = { list: [token], count: 1 }
      }

      return list
    },
    {}
  )

  const duplicates = Object.values(tokensByDenom).filter((item) => {
    const itemWithType = item as { count: number; list: Token[] }

    return itemWithType.count !== 1
  }) as { count: number; list: Token[] }[]

  if (duplicates.length > 0) {
    console.log(`Duplicates found on: ${path}`)
    duplicates.forEach(({ list }) => {
      console.log(list[0].denom)
    })

    return
  }

  console.log(`No duplicates found on: ${path}`)
}

checkForDuplicate(Network.Devnet)
checkForDuplicate(Network.TestnetSentry)
checkForDuplicate(Network.MainnetSentry)
