import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { Network, isMainnet } from '@injectivelabs/networks'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import { getNetworkFileName } from './helper/utils'
import { Token, AlchemyTokenSource } from './types'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'

const alchemyMainnet = new Alchemy({
  apiKey: process.env.ALCHEMY_KEY,
  network: AlchemyNetwork.ETH_MAINNET
})

const alchemySepolia = new Alchemy({
  apiKey: process.env.ALCHEMY_SEPOLIA_KEY,
  network: AlchemyNetwork.ETH_SEPOLIA
})

const getExistingPeggyTokensMap = async (
  network: Network
): Promise<Record<string, any>> => {
  try {
    return JSON.parse(
      readFileSync(
        `./../tokens/peggyTokens/${getNetworkFileName(network)}.json`,
        'utf8'
      ) as any
    )
  } catch (e) {
    return {}
  }
}

const formatAlchemyToken = (
  denom: string,
  token: AlchemyTokenSource
): Token => {
  return {
    ...token,
    denom,
    coinGeckoId: '',
    logo: token.logo || 'unknown.png',
    address: denom.replace('peggy', ''),
    tokenType: TokenType.Erc20,
    tokenVerification: TokenVerification.External
  }
}

export const fetchPeggyTokenMetaData = async (
  denom: string,
  network: Network
) => {
  const existingPeggyTokensMap = await getExistingPeggyTokensMap(network)
  const existingPeggyToken = existingPeggyTokensMap[denom.toLowerCase()]

  if (existingPeggyToken) {
    return existingPeggyToken
  }

  const alchemy = isMainnet(network) ? alchemyMainnet : alchemySepolia

  const formattedDenom = denom.replace('peggy', '')

  if (!formattedDenom.startsWith('0x')) {
    return
  }

  const token = (await alchemy.core.getTokenMetadata(
    formattedDenom
  )) as AlchemyTokenSource

  if (!token.symbol || !token.name || !token.symbol) {
    return
  }

  const formattedToken = formatAlchemyToken(denom, token)

  writeFileSync(
    `./../tokens/peggyTokens/${getNetworkFileName(network)}.json`,
    JSON.stringify(
      {
        ...existingPeggyTokensMap,
        [denom.toLowerCase()]: formattedToken
      },
      null,
      2
    )
  )

  return formattedToken
}
