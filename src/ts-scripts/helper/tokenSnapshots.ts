import { Network } from '@injectivelabs/networks'
import { readFileSync } from 'node:fs'
import { updateJSONFile, getNetworkFileName } from './utils'
import type { Token } from '../../types'

export const pruneTokenSnapshots = (network: Network, tokens: Token[]) => {
  const denoms = new Set(tokens.map(token => token.denom))
  const name = getNetworkFileName(network)

  for (const kind of ['bff', 'mito']) {
    const path = `json/tokens/${kind}/${name}.json`
    // An absent snapshot (currently devnet BFF) is not a new public endpoint.
    let data: string
    try {
      data = readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue
      throw error
    }

    const snapshot = JSON.parse(data)
    if (
      !Array.isArray(snapshot) ||
      snapshot.some(token => !token || typeof token.denom !== 'string')
    ) {
      throw new Error(
        `Invalid token snapshot ${path}: expected an array of tokens with string denoms`
      )
    }

    updateJSONFile(path, snapshot.filter(token => denoms.has(token.denom)))
  }
}
