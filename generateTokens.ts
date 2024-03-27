import { TokenType } from '@injectivelabs/token-metadata'
import { writeFileSync } from 'node:fs'
import splTokens from './tokens/spl'
import ibcTokens from './tokens/ibc'
import evmTokens from './tokens/evm'
import cw20Tokens from './tokens/cw20'
import erc20Tokens from './tokens/erc20'
import tokenFactoryTokens from './tokens/tokenFactory'

const formatIbcTokens = () =>
  ibcTokens.map((token) => ({
    isNative: false,
    ...token,
    denom: `ibc/${token.hash}`,
    tokenType: TokenType.Ibc
  }))

const formatTokenFactoryTokens = () =>
  tokenFactoryTokens.map((token) => ({
    isNative: false,
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
        isNative: false,
        ...token,
        denom: `factory/${mainnetContractAdapter}/${token.address}`,
        tokenType: TokenType.Cw20
      },
      {
        isNative: false,
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
    isNative: false,
    ...token,
    denom: token.address,
    tokenType: TokenType.Spl
  }))

const formatEvmTokens = () =>
  evmTokens.map((token) => ({
    isNative: false,
    ...token,
    denom: token.address,
    tokenType: TokenType.Evm
  }))

const formatErc20Tokens = () =>
  erc20Tokens.map((token) => ({
    isNative: false,
    ...token,
    denom: `peggy${token.address}`,
    tokenType: TokenType.Erc20
  }))

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
          ...formatTokenFactoryTokens()
        ],
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
