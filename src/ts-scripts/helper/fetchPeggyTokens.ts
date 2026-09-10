import 'dotenv/config'
import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName,
  bankMetadataToAddressMap
} from './utils'
import { untaggedSymbolMeta } from '../../data/tokens/untaggedSymbolMeta'
import { Token, BankMetadata, AlchemyTokenSource } from '../../types'

const alchemyMainnet = new Alchemy({
  apiKey: process.env.ALCHEMY_KEY,
  network: AlchemyNetwork.ETH_MAINNET
})

const alchemySepolia = new Alchemy({
  apiKey: process.env.ALCHEMY_SEPOLIA_KEY,
  network: AlchemyNetwork.ETH_SEPOLIA
})

const mainnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'src/cache/bankMetadata/mainnet.json' })
)
const testnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'src/cache/bankMetadata/testnet.json' })
)
const devnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'src/cache/bankMetadata/devnet.json' })
)

const getBankMetadataForDenom = (
  denom: string,
  network: Network
): BankMetadata | undefined => {
  if (isMainnet(network)) {
    return mainnetBankMetadataAddressMap[denom]?.[0]
  }

  if (isTestnet(network)) {
    return testnetBankMetadataAddressMap[denom]?.[0]
  }

  return devnetBankMetadataAddressMap[denom]?.[0]
}

/*
  Bank metadata (curated on-chain, can be updated/renamed by chain
  governance, e.g. deprecating a denom) always takes priority over the
  permanently-cached Alchemy ERC20 metadata below, which is only ever
  fetched once per denom and never reflects later renames.
*/
const applyBankMetadataOverrides = (
  token: Token,
  bankMetadata?: BankMetadata
): Token => ({
  ...token,
  ...(bankMetadata?.name && { name: bankMetadata.name }),
  ...(bankMetadata?.symbol && { symbol: bankMetadata.symbol }),
  ...(bankMetadata?.decimals && { decimals: bankMetadata.decimals }),
  ...(bankMetadata?.logo && { externalLogo: bankMetadata.logo }),
  ...(bankMetadata?.description && { description: bankMetadata.description })
})

const formatAlchemyToken = (
  denom: string,
  token: AlchemyTokenSource
): Token => {
  return {
    ...token,
    denom,
    coinGeckoId: untaggedSymbolMeta.Unknown.coinGeckoId,
    logo: token.logo || untaggedSymbolMeta.Unknown.logo,
    address: denom.replace('peggy', ''),
    tokenType: TokenType.Erc20,
    tokenVerification: TokenVerification.Unverified
  }
}

export const fetchPeggyTokenMetaData = async (
  denom: string,
  network: Network
) => {
  const bankMetadata = getBankMetadataForDenom(denom, network)

  const existingPeggyTokensMap = readJSONFile({
    path: `src/generated/tokens/peggyTokens/${getNetworkFileName(
      network
    )}.json`,
    fallback: {}
  })

  const existingPeggyToken = existingPeggyTokensMap[denom.toLowerCase()]

  if (existingPeggyToken) {
    return applyBankMetadataOverrides(existingPeggyToken, bankMetadata)
  }

  const alchemy = isMainnet(network) ? alchemyMainnet : alchemySepolia

  const formattedDenom = denom.replace('peggy', '')

  if (!formattedDenom.startsWith('0x')) {
    return
  }

  const token = (await alchemy.core
    .getTokenMetadata(formattedDenom)
    .catch(() => {
      console.warn(
        `Peggy: Failed to fetch token metadata for denom: ${formattedDenom} on ${network}`
      )
    })) as AlchemyTokenSource | undefined

  if (!token || !token.symbol || !token.name) {
    return
  }

  const formattedToken = formatAlchemyToken(denom, token)

  await updateJSONFile(
    `src/generated/tokens/peggyTokens/${getNetworkFileName(network)}.json`,
    {
      ...existingPeggyTokensMap,
      [denom.toLowerCase()]: formattedToken
    }
  )

  return applyBankMetadataOverrides(formattedToken, bankMetadata)
}
