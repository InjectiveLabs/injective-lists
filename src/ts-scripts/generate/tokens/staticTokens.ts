import {
  TokenType,
  TokenStatic,
  TokenSource,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import { Network, isMainnet } from '@injectivelabs/networks'
import { getStaticTokenSources } from '../../helper/staticTokenSources'
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
      decimals: isMainnet(network)
        ? existingFactoryToken.decimals || token.decimals
        : existingFactoryToken.decimals ?? token.decimals,
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

const generateStaticTokens = async (network: Network) => {
  const sources = getStaticTokenSources(network)
  const list = [
    ...formatEvmTokens(sources.evm, network),
    ...formatIbcTokens(sources.ibc, network),
    ...formatCw20Tokens(sources.cw20, network),
    ...formatErc20Tokens(sources.erc20, network),
    ...formatTokenFactoryTokens(sources.factory, network)
  ]

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
