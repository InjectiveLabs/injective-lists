import 'dotenv/config'
import { readFileSync, writeFile } from 'node:fs'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import { Network, isMainnet } from '@injectivelabs/networks'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { getNetworkFileName } from './helper/utils'
import { Token, AlchemyTokenSource } from './types'

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

  const token = (await alchemy.core
    .getTokenMetadata(formattedDenom)
    .catch(() => {
      console.warn(
        `Peggy: Failed to fetch token metadata for denom: ${formattedDenom} on ${network}`
      )
    })) as AlchemyTokenSource | undefined

  if (!token || !token.symbol || !token.name || !token.symbol) {
    return
  }

  const formattedToken = formatAlchemyToken(denom, token)

  const data = JSON.stringify(
    {
      ...existingPeggyTokensMap,
      [denom.toLowerCase()]: formattedToken
    },
    null,
    2
  )

  writeFile(
    `./../tokens/peggyTokens/${getNetworkFileName(network)}.json`,
    data,
    (err) => {
      if (err) {
        console.error(`Error writing peggy token metadata ${network}:`, err)
      }
    }
  )

  return formattedToken
}
