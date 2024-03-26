import { writeFileSync } from 'node:fs'
import splTokens from './tokens/spl'
import ibcTokens from './tokens/ibc'
import evmTokens from './tokens/evm'
import cw20Tokens from './tokens/cw20'
import erc20Tokens from './tokens/erc20'
import tokenFactoryTokens from './tokens/tokenFactory'

function writeDataToFile() {
  try {
    writeFileSync(
      'tokens.json',
      JSON.stringify(
        [
          ...splTokens,
          ...ibcTokens,
          ...evmTokens,
          ...cw20Tokens,
          ...erc20Tokens,
          ...tokenFactoryTokens
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
