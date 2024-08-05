import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { TokenType, isCw20ContractAddress } from '@injectivelabs/sdk-ts'
import { Token, BankMetadata } from '../types'

export const getTokenType = (denom: string): TokenType => {
  if (!denom) {
    return TokenType.Unknown
  }

  if (denom.startsWith('peggy') || denom.startsWith('0x')) {
    return TokenType.Erc20
  }

  if (denom.startsWith('ibc/')) {
    return TokenType.Ibc
  }

  if (isCw20ContractAddress(denom)) {
    return TokenType.Cw20
  }

  if (denom.startsWith('factory')) {
    return TokenType.TokenFactory
  }

  return TokenType.Unknown
}

export const getNetworkFileName = (network: Network) => {
  if (network === Network.Staging) {
    return 'staging'
  }

  if (isMainnet(network)) {
    return 'mainnet'
  }

  if (isTestnet(network)) {
    return 'testnet'
  }

  return 'devnet'
}

export const denomsToDenomMap = (denoms: string[]) => {
  return denoms.reduce((list, denom) => {
    const formattedDenom = denom.toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = denom

      return list
    }

    return list
  }, {} as Record<string, string>)
}

export const tokensToDenomMap = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = token.denom.toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = token

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...token }

    return list
  }, {} as Record<string, Token>)
}

export const tokensToDenomMapKeepCasing = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = token.denom

    if (!list[formattedDenom]) {
      list[formattedDenom] = token

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...token }

    return list
  }, {} as Record<string, Token>)
}

export const tokenToAddressMap = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = (token?.address || token.denom).toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = token

      return list
    }

    list[formattedDenom] = { ...list[formattedDenom], ...token }

    return list
  }, {} as Record<string, Token>)
}

export const tokensToAddressMap = (tokens: Token[]) => {
  return tokens.reduce((list, token) => {
    const formattedDenom = (token?.address || token.denom).toLowerCase()

    if (!list[formattedDenom]) {
      list[formattedDenom] = [token]

      return list
    }

    list[formattedDenom] = [...list[formattedDenom], token]

    return list
  }, {} as Record<string, Token[]>)
}

export const bankMetadataToAddressMap = (metadatas: BankMetadata[]) => {
  return metadatas.reduce((list, metadata) => {
    const formattedDenom = metadata.denom

    if (!list[formattedDenom]) {
      list[formattedDenom] = [metadata]

      return list
    }

    list[formattedDenom] = [...list[formattedDenom], metadata]

    return list
  }, {} as Record<string, BankMetadata[]>)
}

export const isFileExist = (path: string) => {
  const filePath = `./../../${path}`

  return existsSync(resolve(__dirname, filePath))
}

export const readJSONFile = ({
  path,
  fallback = []
}: {
  path: string
  fallback?: Array<any> | Record<string, any>
}) => {
  const filePath = `./../../${path}`

  if (!isFileExist(path)) {
    console.log(`readJSONFile: ${filePath} not found`)

    return fallback
  }

  try {
    const data = readFileSync(resolve(__dirname, filePath), 'utf8')

    return JSON.parse(data)
  } catch (e: any) {
    console.error(`Error reading JSON file: ${path}`, e)

    return fallback
  }
}

export const updateJSONFile = (path: string, data: any) => {
  const filePath = `./../../${path}`
  const dirPath = dirname(resolve(__dirname, filePath))

  if (!isFileExist(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true })
    } catch (e: any) {
      console.log('error creating directory', e)
    }
  }

  try {
    writeFileSync(resolve(__dirname, filePath), JSON.stringify(data, null, 2))
  } catch (e: any) {
    console.error(`Error updating JSON file: ${path}`, e)
  }
}
