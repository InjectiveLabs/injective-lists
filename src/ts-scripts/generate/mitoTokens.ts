import { pathToFileURL } from 'node:url'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import { Network, isMainnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../helper/utils'
import { getMarketById } from '../helper/market'
import { untaggedSymbolMeta } from '../../data/tokens/untaggedSymbolMeta'

const mainnetVaults = readJSONFile({
  path: 'src/cache/mito/mainnet.json'
})

export const generateMitoTokens = async (network: Network) => {
  if (!isMainnet(network)) return

  const mitoVaults = mainnetVaults

  try {
    const mitoTokens = []

    for (const vault of mitoVaults) {
      const denom = `factory/${vault.masterContractAddress}/lp${vault.contractAddress}`

      if (!vault.masterContractAddress) {
        continue
      }

      const market = getMarketById(vault.marketId, network)

      const mitoToken = {
        ...untaggedSymbolMeta.Unknown,
        denom,
        decimals: 18,
        address: vault.contractAddress,
        logo: 'mito.svg',
        marketId: [vault.marketId],
        tokenType: TokenType.Lp,
        tokenVerification: TokenVerification.Verified
      }

      if (!market) {
        mitoTokens.push(mitoToken)

        continue
      }

      const formattedTicker = market.ticker
        .replaceAll('/', '-')
        .replaceAll(' ', '-')

      mitoTokens.push({
        ...mitoToken,
        symbol: `MITO-${formattedTicker}`,
        name: `${formattedTicker} LP`
      })
    }

    if (mitoTokens.length === 0) {
      return
    }

    await updateJSONFile(
      `src/generated/tokens/mito/${getNetworkFileName(network)}.json`,
      mitoTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ generateMitoTokens ${network}`)
  } catch (e) {
    console.log('Error generating mito tokens:', e)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateMitoTokens(Network.MainnetSentry)
}
