import { pathToFileURL } from 'node:url'
import {
  TokenType,
  TokenStatic,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import { Network, isMainnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName,
  tokensToDenomMapKeepCasing
} from '../../helper/utils'
import { getCw20Denom } from '../../helper/getter'
import { fetchCw20Token } from '../../helper/fetchCw20Metadata'
import { fetchIbcTokenMetaData } from '../../helper/fetchIbcDenomTrace'
import { verifiedTokenFactoryDenoms } from '../../../data/tokens/denoms'
import { untaggedSymbolMeta } from '../../../data/tokens/untaggedSymbolMeta'

const mainnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'src/generated/tokens/staticTokens/mainnet.json'
  })
)

const mainnetBankFactoryTokens = readJSONFile({
  path: 'src/cache/bankMetadata/mainnet.json'
})
const mainnetCw20Denoms = readJSONFile({
  path: 'src/cache/cw20Denoms/mainnet.json'
})
export const generateCw20FactoryTokens = async (network: Network) => {
  if (!isMainnet(network)) return

  const denoms = mainnetCw20Denoms
  const staticTokensMap = mainnetStaticTokensMap
  const bankMetadataDenoms = mainnetBankFactoryTokens.map(
    (token: TokenStatic) => token.denom
  )

  try {
    const cw20FactoryTokens = []

    for (const denom of denoms) {
      if (staticTokensMap[denom]) {
        continue
      }

      if (bankMetadataDenoms.includes(denom)) {
        continue
      } else {
        console.log('generateCw20FactoryToken', denom)
      }

      const factoryCw20Denom = getCw20Denom(denom, network)
      const token = await fetchCw20Token(factoryCw20Denom, network)

      if (!token) {
        continue
      }

      cw20FactoryTokens.push(token)
    }

    await updateJSONFile(
      `src/generated/tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
      cw20FactoryTokens.sort((a, b) => a.denom.localeCompare(b.denom))
    )

    console.log(`✅✅✅ GenerateCw20FactoryTokens ${network}`)
  } catch (e) {
    console.log('Error generating cw20 factory tokens:', e)
  }
}

export const generateBankFactoryTokens = async (network: Network) => {
  if (!isMainnet(network)) return

  const bankMetadatas = mainnetBankFactoryTokens
  const staticTokensMap = mainnetStaticTokensMap

  try {
    const bankIbcTokens = []
    const bankFactoryTokens = []

    for (const bankMetadata of bankMetadatas) {
      if (
        staticTokensMap[bankMetadata.denom] ||
        bankMetadata.denom.startsWith('share')
      ) {
        continue
      }

      if (bankMetadata.denom.includes('ibc/')) {
        const ibcToken = await fetchIbcTokenMetaData(
          bankMetadata.denom,
          network
        )

        bankIbcTokens.push(ibcToken)

        continue
      }

      const subDenom = bankMetadata.denom.split('/').pop()

      const address = isCw20ContractAddress(subDenom)
        ? subDenom
        : bankMetadata.denom

      const tokenType = bankMetadata.denom.startsWith('erc20:')
        ? TokenType.Evm
        : TokenType.TokenFactory

      const isVerified = verifiedTokenFactoryDenoms.includes(bankMetadata.denom)

      bankFactoryTokens.push({
        ...untaggedSymbolMeta.Unknown,
        name: bankMetadata.name || bankMetadata.denom,
        address: address,
        denom: bankMetadata.denom,
        decimals: bankMetadata.decimals,
        ...(bankMetadata?.description && {
          description: bankMetadata.description
        }),
        ...(bankMetadata?.symbol && { symbol: bankMetadata.symbol }),
        ...(bankMetadata?.logo && { externalLogo: bankMetadata.logo }),
        tokenType,
        tokenVerification: isVerified
          ? TokenVerification.Verified
          : TokenVerification.Unverified
      })
    }

    if (bankFactoryTokens.length === 0) {
      return
    }

    await updateJSONFile(
      `src/generated/tokens/factoryTokens/${getNetworkFileName(network)}.json`,
      [...bankFactoryTokens, ...bankIbcTokens].sort((a, b) =>
        a.denom.localeCompare(b.denom)
      )
    )

    console.log(`✅✅✅ GenerateBankFactoryTokens ${network}`)
  } catch (e) {
    console.log('Error generating bank factory tokens:', e)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateCw20FactoryTokens(Network.MainnetSentry)
  generateBankFactoryTokens(Network.MainnetSentry)
}
