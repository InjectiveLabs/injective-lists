import 'dotenv/config'
import { Network, isMainnet } from '@injectivelabs/networks'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'
import { Token, AlchemyTokenSource } from './types'

const alchemyMainnet = new Alchemy({
  apiKey: process.env.ALCHEMY_KEY,
  network: AlchemyNetwork.ETH_MAINNET
})

const alchemySepolia = new Alchemy({
  apiKey: process.env.ALCHEMY_SEPOLIA_KEY,
  network: AlchemyNetwork.ETH_SEPOLIA
})

const formatAlchemyToken = (
  denom: string,
  token: AlchemyTokenSource
): Token => {
  return {
    ...token,
    denom,
    coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
    logo: token.logo || untaggedSymbolMeta.Unknown.logo,
    address: denom.replace('peggy', ''),
    tokenType: TokenType.Erc20,
    tokenVerification: TokenVerification.External
  }
}

export const fetchPeggyTokenMetaData = async (
  denom: string,
  network: Network
) => {
  const existingPeggyTokensMap = readJSONFile({
    path: `tokens/peggyTokens/${getNetworkFileName(network)}.json`,
    fallback: {}
  })

  const existingPeggyToken = existingPeggyTokensMap[denom.toLowerCase()]

  if (existingPeggyToken) {
    return existingPeggyToken
  }

  const alchemy = isMainnet(network) ? alchemyMainnet : alchemySepolia

  const formattedDenom = denom.replace('peggy', '')

  if (!formattedDenom.startsWith('0x')) {
    return
  }

  const token = (await alchemy.core
    .getTokenMetadata(formattedDenom)
    .catch(() => {
      console.warn(
        `Peggy: Failed to fetch token metadata for denom: ${formattedDenom} on ${network}`
      )
    })) as AlchemyTokenSource | undefined

  if (!token || !token.symbol || !token.name) {
    return
  }

  const formattedToken = formatAlchemyToken(denom, token)

  await updateJSONFile(
    `tokens/peggyTokens/${getNetworkFileName(network)}.json`,
    {
      ...existingPeggyTokensMap,
      [denom.toLowerCase()]: formattedToken
    }
  )

  return formattedToken
}
