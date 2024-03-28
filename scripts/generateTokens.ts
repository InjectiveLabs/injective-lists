import { writeFileSync } from 'node:fs'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import splTokens from '../tokens/spl'
import ibcTokens from '../tokens/ibc'
import evmTokens from '../tokens/evm'
import cw20Tokens from '../tokens/cw20'
import erc20Tokens from '../tokens/erc20'
import tokenFactoryTokens from '../tokens/tokenFactory'
import { symbolMeta } from '../tokens/symbolMeta'

const formatIbcTokens = () =>
  ibcTokens.map((token) => ({
    ...token,
    denom: `ibc/${token.hash}`,
    tokenType: TokenType.Ibc
  }))

const formatTokenFactoryTokens = () =>
  tokenFactoryTokens.map((token) => ({
    ...token,
    denom: `factory/${token.creator}/${token.symbol.toLowerCase()}`,
    tokenType: TokenType.TokenFactory
  }))

const formatCw20Tokens = () => {
  const mainnetContractAdapter = 'inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk'
  const devnetTestnetContractAdapter =
    'inj1hdvy6tl89llqy3ze8lv6mz5qh66sx9enn0jxg6'

  return cw20Tokens.reduce(
    (tokens, token) => [
      ...tokens,
      {
        ...token,
        denom: `factory/${mainnetContractAdapter}/${token.address}`,
        tokenType: TokenType.Cw20
      },
      {
        ...token,
        denom: `factory/${devnetTestnetContractAdapter}/${token.address}`,
        tokenType: TokenType.Cw20
      }
    ],
    [] as any[]
  )
}

const formatSplTokens = () =>
  splTokens.map((token) => ({
    ...token,
    denom: token.address,
    tokenType: TokenType.Spl
  }))

const formatEvmTokens = () =>
  evmTokens.map((token) => ({
    ...token,
    denom: token.address,
    tokenType: TokenType.Evm
  }))

const formatErc20Tokens = () =>
  erc20Tokens.map((token) => ({
    ...token,
    denom: `peggy${token.address}`,
    tokenType: TokenType.Erc20
  }))

// perp market base tokens
const symbolBaseTokens = () =>
  Object.values(symbolMeta).map((meta) => {
    return {
      ...meta,
      isNative: meta.symbol === 'INJ',
      tokenType: 'symbol', // update to use TokenType.Symbol after pumping injective-ts
      denom: meta.symbol.toLowerCase(),
      address: meta.symbol.toLowerCase()
    }
  })

const writeDataToFile = () => {
  try {
    writeFileSync(
      'tokens.json',
      JSON.stringify(
        [
          ...formatEvmTokens(),
          ...formatSplTokens(),
          ...formatIbcTokens(),
          ...formatCw20Tokens(),
          ...formatErc20Tokens(),
          ...formatTokenFactoryTokens(),
          ...symbolBaseTokens()
        ].map((token) => ({
          isNative: false,
          ...token,
          tokenVerification: TokenVerification.Verified
        })),
        null,
        '\t'
      )
    )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

writeDataToFile()
