import { writeFileSync } from 'node:fs'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import * as tokens from '../tokens.json'
import { getMetadata } from './fetchBankMetadata'
import * as existingTokens from '../externalTokens.json'
import * as bankSupplyDenoms from '../bankSupplyDenoms.json'
import * as existingSupplyTokens from '../supplyTokens.json'
import { getTokenType, getDenomTrace, getSymbolMeta } from './helper/utils'

export const generateSupplyToken = async () => {
  try {
    const filteredDenoms = bankSupplyDenoms.filter((denom) => {
      if (tokens.some((token) => token.denom === denom)) {
        return false
      }

      if (existingTokens.some((token) => token.denom === denom)) {
        return false
      }

      return true
    })

    const supplyTokens = await Promise.all(
      filteredDenoms.map(async (denom) => {
        if (denom.startsWith('ibc/')) {
          const existingIbcToken = existingSupplyTokens.find(
            (token: { denom: string }) => token.denom === denom
          ) as any

          if (existingIbcToken) {
            return existingIbcToken
          }

          const { path, channelId, baseDenom } = (await getDenomTrace(
            denom
          )) || {
            path: '',
            channelId: '',
            baseDenom: 'Unknown'
          }

          return {
            denom,
            path,
            channelId,
            baseDenom,
            isNative: false,
            name: denom,
            coinGeckoId: '',
            decimals: 18,
            symbol: 'Unknown',
            logo: 'unknown.png',
            tokenType: TokenType.Ibc,
            tokenVerification: TokenVerification.Unverified
          }
        }

        const bankMetadata = getMetadata(denom)

        return {
          isNative: false,
          ...(getSymbolMeta({
            denom,
            symbol: bankMetadata?.symbol || 'Unknown'
          }) || {
            coinGeckoId: '',
            denom: denom || '',
            name: bankMetadata?.name || 'Unknown',
            decimals: bankMetadata?.decimals || 18,
            symbol: bankMetadata?.symbol || 'Unknown',
            logo: bankMetadata?.logo || 'unknown.png'
          }),
          tokenType: getTokenType(denom),
          tokenVerification: TokenVerification.Unverified
        }
      })
    )

    writeFileSync('supplyTokens.json', JSON.stringify(supplyTokens, null, 2))
  } catch (e) {}
}

generateSupplyToken()
