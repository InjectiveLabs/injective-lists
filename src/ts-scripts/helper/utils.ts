import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ChainId } from '@injectivelabs/ts-types'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { TokenType, isCw20ContractAddress } from '@injectivelabs/sdk-ts'
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { Token, BankMetadata } from '../../types'

// ES module polyfill for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

export const isDenom = (denom: string): boolean => {
  if (!denom) {
    return false
  }

  // Native: inj
  if (denom === 'inj') {
    return true
  }

  // IBC denoms: ibc/...
  if (denom.startsWith('ibc/')) {
    return true
  }

  // ERC20/Peggy denoms: peggy0x... or 0x...
  if (denom.startsWith('peggy') || denom.startsWith('0x')) {
    return true
  }

  // EVM denoms: erc20:0x...
  if (denom.startsWith('erc20:')) {
    return true
  }

  // Token factory denoms: factory/...
  if (denom.startsWith('factory/')) {
    return true
  }

  // CW20 contract addresses: inj1... (bech32 format)
  if (isCw20ContractAddress(denom)) {
    return true
  }

  // Insurance fund shares: share followed by numbers
  if (/^share\d+$/.test(denom)) {
    return true
  }

  return false
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
  const result: Record<string, string> = {}

  for (const denom of denoms) {
    const formattedDenom = denom.toLowerCase()

    if (!result[formattedDenom]) {
      result[formattedDenom] = denom
    }
  }

  return result
}

export const tokensToDenomMap = (tokens: Token[]) => {
  const result: Record<string, Token> = {}

  for (const token of tokens) {
    const formattedDenom = token.denom.toLowerCase()

    if (!result[formattedDenom]) {
      result[formattedDenom] = token
    } else {
      // Merge properties efficiently without spread
      Object.assign(result[formattedDenom], token)
    }
  }

  return result
}

export const tokensToDenomMapKeepCasing = (tokens: Token[]) => {
  const result: Record<string, Token> = {}

  for (const token of tokens) {
    const formattedDenom = token.denom

    if (!result[formattedDenom]) {
      result[formattedDenom] = token
    } else {
      // Merge properties efficiently without spread
      Object.assign(result[formattedDenom], token)
    }
  }

  return result
}

export const tokenToAddressMap = (tokens: Token[]) => {
  const result: Record<string, Token> = {}

  for (const token of tokens) {
    const formattedDenom = (token?.address || token.denom).toLowerCase()

    if (!result[formattedDenom]) {
      result[formattedDenom] = token
    } else {
      // Merge properties efficiently without spread
      Object.assign(result[formattedDenom], token)
    }
  }

  return result
}

export const tokensToAddressMap = (tokens: Token[]) => {
  const result: Record<string, Token[]> = {}

  for (const token of tokens) {
    const formattedDenom = (token?.address || token.denom).toLowerCase()

    if (!result[formattedDenom]) {
      result[formattedDenom] = [token]
    } else {
      result[formattedDenom].push(token)
    }
  }

  return result
}

export const bankMetadataToAddressMap = (metadatas: BankMetadata[]) => {
  const result: Record<string, BankMetadata[]> = {}

  for (const metadata of metadatas) {
    const formattedDenom = metadata.denom

    if (!result[formattedDenom]) {
      result[formattedDenom] = [metadata]
    } else {
      result[formattedDenom].push(metadata)
    }
  }

  return result
}

export const isFileExist = (path: string) => {
  return existsSync(path)
}

const findRootDirectory = (currentDir: string): string => {
  if (existsSync(resolve(currentDir, '.gitignore'))) {
    return currentDir
  }

  const parentDir = dirname(currentDir)

  if (parentDir === currentDir) {
    throw new Error('Root directory not found')
  }

  return findRootDirectory(parentDir)
}

export const readJSONFile = ({
  path,
  fallback = []
}: {
  path: string
  fallback?: Array<any> | Record<string, any>
}) => {
  const rootDir = findRootDirectory(__dirname)
  const filePath = `${rootDir}/${path}`

  if (!isFileExist(filePath)) {
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
  const rootDir = findRootDirectory(__dirname)
  const filePath = `${rootDir}/${path}`
  const dirPath = dirname(filePath)

  if (!isFileExist(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true })
    } catch (e: any) {
      console.log('error creating directory', e)
    }
  }

  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (e: any) {
    console.error(`Error updating JSON file: ${path}`, e)
  }
}

export const getChainIdFromNetwork = (network: Network) => {
  if (isMainnet(network)) {
    return ChainId.Mainnet
  }

  if (isTestnet(network)) {
    return ChainId.Testnet
  }

  return ChainId.Devnet
}
