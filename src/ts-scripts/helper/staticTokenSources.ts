import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  mainnetTokens as ibcMainnetTokens,
  testnetTokens as ibcTestnetTokens
} from '../../data/tokens/ibc'
import {
  devnetTokens as evmDevnetTokens,
  mainnetTokens as evmMainnetTokens,
  testnetTokens as evmTestnetTokens
} from '../../data/tokens/evm'
import {
  devnetTokens as cw20DevnetTokens,
  mainnetTokens as cw20MainnetTokens,
  testnetTokens as cw20TestnetTokens
} from '../../data/tokens/cw20'
import {
  devnetTokens as erc20DevnetTokens,
  mainnetTokens as erc20MainnetTokens,
  testnetTokens as erc20TestnetTokens
} from '../../data/tokens/erc20'
import {
  devnetTokens as tokenFactoryDevnetTokens,
  mainnetTokens as tokenFactoryMainnetTokens,
  testnetTokens as tokenFactoryTestnetTokens
} from '../../data/tokens/tokenFactory'

// Keep cross-network inheritance in one place for generation and bounded lookups.
export const getStaticTokenSources = (network: Network) => {
  if (isMainnet(network)) {
    return {
      evm: evmMainnetTokens,
      ibc: ibcMainnetTokens,
      cw20: cw20MainnetTokens,
      erc20: erc20MainnetTokens,
      factory: tokenFactoryMainnetTokens
    }
  }

  const testnet = isTestnet(network)

  return {
    evm: testnet ? evmTestnetTokens : evmDevnetTokens,
    ibc: [...ibcTestnetTokens, ...ibcMainnetTokens],
    cw20: [
      ...(testnet ? cw20TestnetTokens : cw20DevnetTokens),
      ...(testnet ? cw20DevnetTokens : cw20TestnetTokens),
      ...cw20MainnetTokens
    ],
    erc20: [
      ...(testnet ? erc20TestnetTokens : erc20DevnetTokens),
      ...(testnet ? erc20DevnetTokens : erc20TestnetTokens),
      ...erc20MainnetTokens
    ],
    factory: [
      ...(testnet ? tokenFactoryTestnetTokens : tokenFactoryDevnetTokens),
      ...(testnet ? tokenFactoryDevnetTokens : tokenFactoryTestnetTokens),
      ...tokenFactoryMainnetTokens
    ]
  }
}

export const filterCuratedCw20Denoms = (denoms: string[], network: Network) => {
  const addresses = new Set(
    getStaticTokenSources(network).cw20.map(token => token.address)
  )

  return [...new Set(denoms)]
    .filter(denom => {
      const parts = denom.split('/')
      return parts.length === 3 && parts[0] === 'factory' && addresses.has(parts[2])
    })
    .sort((a, b) => a.localeCompare(b))
}

export const getCuratedBankDenoms = (network: Network, cw20Denoms: string[]) => {
  const sources = getStaticTokenSources(network)

  return [...new Set([
    'inj',
    ...sources.evm.map(token => token.address),
    ...sources.ibc.map(token => `ibc/${token.hash}`),
    ...sources.erc20.map(token => `peggy${token.address}`),
    ...sources.factory.map(token =>
      `factory/${token.creator}/${token.subdenom || token.symbol.toLowerCase()}`
    ),
    ...filterCuratedCw20Denoms(cw20Denoms, network)
  ])]
}
