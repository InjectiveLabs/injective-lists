import {
  TokenType,
  TokenStatic,
  TokenSource,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import { Network } from '@injectivelabs/networks'
import {
  mainnetTokens as ibcMainnetTokens,
  testnetTokens as ibcTestnetTokens
} from '../../../data/tokens/ibc'
import {
  devnetTokens as evmDevnetTokens,
  mainnetTokens as evmMainnetTokens,
  testnetTokens as evmTestnetTokens
} from '../../../data/tokens/evm'
import {
  devnetTokens as cw20DevnetTokens,
  mainnetTokens as cw20MainnetTokens,
  testnetTokens as cw20TestnetTokens
} from '../../../data/tokens/cw20'
import {
  devnetTokens as erc20DevnetTokens,
  mainnetTokens as erc20MainnetTokens,
  testnetTokens as erc20TestnetTokens
} from '../../../data/tokens/erc20'
import {
  devnetTokens as tokenFactoryDevnetTokens,
  mainnetTokens as tokenFactoryMainnetTokens,
  testnetTokens as tokenFactoryTestnetTokens
} from '../../../data/tokens/tokenFactory'
import {
  getCw20Denom,
  getSupplyDenom,
  getBankTokenFactoryMetadataByAddress
} from '../../helper/getter'
import { symbolMeta } from '../../../data/tokens/symbolMeta'
import { updateJSONFile, getNetworkFileName } from '../../helper/utils'
import { verifiedTokenFactoryDenoms } from './../../../data/tokens/denoms'
import { cryptoRankIdMap, overrideSymbolMap } from '../../../data/staticMap'
import { untaggedSymbolMeta } from '../../../data/tokens/untaggedSymbolMeta'
import {
  IbcTokenSource,
  Cw20TokenSource,
  PeggyTokenSource,
  TokenFactorySource
} from '../../../types'

// Type assertion helper to convert between TokenSource types
const convertTokenSource = (source: any): TokenSource | undefined => {
  if (!source) {
    return undefined
  }

  return source as TokenSource
}

const INJ_TOKEN = {
  isNative: true,
  ...symbolMeta.INJ,
  denom: 'inj',
  address: 'inj',
  tokenType: TokenType.Native,
  tokenVerification: TokenVerification.Verified
}

const formatEvmTokens = (tokens: any[], network: Network) => {
  return tokens.map((token) => {
    const denom = token.address.toLowerCase()
    const supplyDenom = getSupplyDenom(denom, network)

    return {
      ...token,
      denom: supplyDenom || denom,
      address: (supplyDenom || denom).replace('erc20:', ''),
      tokenType: TokenType.Erc20,
      tokenVerification: TokenVerification.Verified
    }
  })
}

const formatIbcTokens = (tokens: IbcTokenSource[], network: Network) =>
  tokens.map((token) => {
    const denom = `ibc/${token.hash}`
    const supplyDenom = getSupplyDenom(denom, network)

    return {
      ...token,
      denom: supplyDenom || denom,
      tokenType: TokenType.Ibc
    }
  })

const formatTokenFactoryTokens = (
  tokens: TokenFactorySource[],
  network: Network
) => {
  return tokens.reduce((list, token) => {
    if (!token.symbol) {
      console.log(token)
    }

    const subdenom = token.subdenom || token.symbol.toLowerCase()
    const denom = `factory/${token.creator}/${subdenom}`
    const supplyDenom = getSupplyDenom(denom, network)

    list.push({
      ...token,
      address: supplyDenom || denom,
      denom: supplyDenom || denom,
      tokenType: TokenType.TokenFactory,
      tokenVerification: verifiedTokenFactoryDenoms.includes(
        supplyDenom || denom
      )
        ? TokenVerification.Verified
        : TokenVerification.Unverified
    })

    return list
  }, [] as TokenStatic[])
}

const formatCw20Tokens = (tokens: Cw20TokenSource[], network: Network) => {
  return tokens.reduce((list, token) => {
    // override the denom & decimals using data from the chain
    const factoryCw20Denom = getCw20Denom(token.address, network)

    if (!factoryCw20Denom) {
      return list
    }

    list.push({
      ...token,
      denom: factoryCw20Denom,
      address: token.address,
      tokenType: TokenType.Cw20,
      tokenVerification: TokenVerification.Verified,
      decimals: token.decimals,
      source: convertTokenSource(token.source)
    })

    const existingFactoryToken = getBankTokenFactoryMetadataByAddress(
      factoryCw20Denom,
      network
    )

    if (!existingFactoryToken) {
      return list
    }

    list.push({
      ...token,
      denom: factoryCw20Denom,
      address: existingFactoryToken.address,
      tokenType: TokenType.TokenFactory,
      tokenVerification: TokenVerification.Verified,
      decimals: existingFactoryToken?.decimals || token.decimals,
      source: convertTokenSource(token.source)
    })

    return list
  }, [] as TokenStatic[])
}

const formatErc20Tokens = (tokens: PeggyTokenSource[], network: Network) =>
  tokens.map((token) => {
    const denom = `peggy${token.address}`
    const supplyDenom = getSupplyDenom(denom, network)

    return {
      ...token,
      denom: supplyDenom || denom,
      tokenType: TokenType.Erc20
    }
  })

// perp market base tokens
const untaggedSymbolBaseTokens = () =>
  Object.values(untaggedSymbolMeta).map((meta) => {
    return {
      ...meta,
      tokenType: TokenType.Symbol,
      tokenVerification: TokenVerification.Verified,
      denom: meta.symbol.toLowerCase(),
      address: meta.symbol.toLowerCase()
    }
  })

const getDevnetStaticTokenList = () => {
  return [
    ...formatEvmTokens(evmDevnetTokens, Network.Devnet),
    ...formatIbcTokens(
      [...ibcTestnetTokens, ...ibcMainnetTokens],
      Network.Devnet
    ),
    ...formatCw20Tokens(
      [...cw20DevnetTokens, ...cw20TestnetTokens, ...cw20MainnetTokens],
      Network.Devnet
    ),
    ...formatErc20Tokens(
      [...erc20DevnetTokens, ...erc20TestnetTokens, ...erc20MainnetTokens],
      Network.Devnet
    ),
    ...formatTokenFactoryTokens(
      [
        ...tokenFactoryDevnetTokens,
        ...tokenFactoryTestnetTokens,
        ...tokenFactoryMainnetTokens
      ],
      Network.Devnet
    )
  ]
}

const getTestnetStaticTokenList = () => {
  return [
    ...formatEvmTokens(evmTestnetTokens, Network.TestnetSentry),
    ...formatIbcTokens(
      [...ibcTestnetTokens, ...ibcMainnetTokens],
      Network.TestnetSentry
    ),
    ...formatCw20Tokens(
      [...cw20TestnetTokens, ...cw20DevnetTokens, ...cw20MainnetTokens],
      Network.TestnetSentry
    ),
    ...formatErc20Tokens(
      [...erc20TestnetTokens, ...erc20DevnetTokens, ...erc20MainnetTokens],
      Network.TestnetSentry
    ),
    ...formatTokenFactoryTokens(
      [
        ...tokenFactoryTestnetTokens,
        ...tokenFactoryDevnetTokens,
        ...tokenFactoryMainnetTokens
      ],
      Network.TestnetSentry
    )
  ]
}

const getMainnetStaticTokenList = () => {
  return [
    ...formatEvmTokens(evmMainnetTokens, Network.MainnetSentry),
    ...formatIbcTokens(ibcMainnetTokens, Network.MainnetSentry),
    ...formatCw20Tokens(cw20MainnetTokens, Network.MainnetSentry),
    ...formatErc20Tokens(erc20MainnetTokens, Network.MainnetSentry),
    ...formatTokenFactoryTokens(
      tokenFactoryMainnetTokens,
      Network.MainnetSentry
    )
  ]
}

const generateStaticTokens = async (network: Network) => {
  let list = [] as any

  if (network === Network.Devnet) {
    list = getDevnetStaticTokenList()
  }

  if (network === Network.TestnetSentry) {
    list = getTestnetStaticTokenList()
  }

  if (network === Network.MainnetSentry) {
    list = getMainnetStaticTokenList()
  }

  await updateJSONFile(
    `src/generated/tokens/staticTokens/${getNetworkFileName(network)}.json`,
    [INJ_TOKEN, ...list, ...untaggedSymbolBaseTokens()]
      .map((token) => ({
        address: token.denom,
        isNative: false,
        tokenVerification: TokenVerification.Verified,
        ...token,
        ...(cryptoRankIdMap[token.symbol] && {
          cryptoRankId: cryptoRankIdMap[token.symbol]
        }),
        ...(overrideSymbolMap[token.symbol] && {
          overrideSymbol: overrideSymbolMap[token.symbol]
        })
      }))
      .sort((a, b) => a.denom.localeCompare(b.denom))
  )

  console.log(`✅✅✅ GenerateStaticTokens ${network}`)
}

generateStaticTokens(Network.Devnet)
generateStaticTokens(Network.TestnetSentry)
generateStaticTokens(Network.MainnetSentry)
