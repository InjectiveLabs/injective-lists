import {
  TokenType,
  TokenStatic,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
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

const testnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'src/generated/tokens/staticTokens/testnet.json'
  })
)

const devnetStaticTokensMap = tokensToDenomMapKeepCasing(
  readJSONFile({
    path: 'src/generated/tokens/staticTokens/devnet.json'
  })
)

const mainnetBankFactoryTokens = readJSONFile({
  path: 'src/cache/bankMetadata/mainnet.json'
})
const testnetBankFactoryTokens = readJSONFile({
  path: 'src/cache/bankMetadata/testnet.json'
})
const devnetBankFactoryTokens = readJSONFile({
  path: 'src/cache/bankMetadata/devnet.json'
})

const mainnetCw20Denoms = readJSONFile({
  path: 'src/cache/cw20Denoms/mainnet.json'
})
const testnetCw20Denoms = readJSONFile({
  path: 'src/cache/cw20Denoms/testnet.json'
})
const devnetCw20Denoms = readJSONFile({
  path: 'src/cache/cw20Denoms/devnet.json'
})

const getStaticTokensMap = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetStaticTokensMap
  }

  if (isTestnet(network)) {
    return testnetStaticTokensMap
  }

  return devnetStaticTokensMap
}

const getBankFactoryDenoms = (network: Network) => {
  if (isMainnet(network)) {
    return mainnetBankFactoryTokens.map((token: TokenStatic) => token.denom)
  }

  if (isTestnet(network)) {
    return testnetBankFactoryTokens.map((token: TokenStatic) => token.denom)
  }

  return devnetBankFactoryTokens.map((token: TokenStatic) => token.denom)
}

export const generateCw20FactoryTokens = async (network: Network) => {
  let denoms = devnetCw20Denoms
  const staticTokensMap = getStaticTokensMap(network)
  const bankMetadataDenoms = getBankFactoryDenoms(network)

  if (isTestnet(network)) {
    denoms = testnetCw20Denoms
  }

  if (isMainnet(network)) {
    denoms = mainnetCw20Denoms
  }

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
  let bankMetadatas = devnetBankFactoryTokens
  const staticTokensMap = getStaticTokensMap(network)

  if (isTestnet(network)) {
    bankMetadatas = testnetBankFactoryTokens
  }

  if (isMainnet(network)) {
    bankMetadatas = mainnetBankFactoryTokens
  }

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
        name: bankMetadata.denom,
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

generateCw20FactoryTokens(Network.Devnet)
generateCw20FactoryTokens(Network.TestnetSentry)
generateCw20FactoryTokens(Network.MainnetSentry)

generateBankFactoryTokens(Network.Devnet)
generateBankFactoryTokens(Network.TestnetSentry)
generateBankFactoryTokens(Network.MainnetSentry)
