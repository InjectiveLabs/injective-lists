import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import {
  Network,
  isMainnet,
  isTestnet,
  CW20_ADAPTER_CONTRACT_BY_NETWORK
} from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'
import { fetchCw20Token } from './fetchCw20Metadata'
import { untaggedSymbolMeta } from './data/untaggedSymbolMeta'

const mainnetBankFactoryTokens = readJSONFile({
  path: 'data/bankMetadata/mainnet.json'
})
const testnetBankFactoryTokens = readJSONFile({
  path: 'data/bankMetadata/testnet.json'
})
const devnetBankFactoryTokens = readJSONFile({
  path: 'data/bankMetadata/devnet.json'
})

const mainnetCw20Denoms = readJSONFile({
  path: 'data/cw20Denoms/mainnet.json'
})
const testnetCw20Denoms = readJSONFile({
  path: 'data/cw20Denoms/testnet.json'
})
const devnetCw20Denoms = readJSONFile({
  path: 'data/cw20Denoms/devnet.json'
})

export const generateCw20FactoryTokens = async (network: Network) => {
  let denoms = devnetCw20Denoms
  const adapterContractAddress = CW20_ADAPTER_CONTRACT_BY_NETWORK[network]

  if (isTestnet(network)) {
    denoms = testnetCw20Denoms
  }

  if (isMainnet(network)) {
    denoms = mainnetCw20Denoms
  }

  try {
    const cw20FactoryTokens = []

    for (const denom of denoms) {
      const token = await fetchCw20Token(
        `factory/${adapterContractAddress}/${denom}`,
        network
      )

      cw20FactoryTokens.push(token)
    }

    await updateJSONFile(
      `tokens/cw20Tokens/${getNetworkFileName(network)}.json`,
      cw20FactoryTokens
    )

    console.log(`✅✅✅ GenerateCw20FactoryTokens ${network}`)
  } catch (e) {
    console.log('Error generating cw20 factory tokens:', e)
  }
}

export const generateBankFactoryTokens = async (network: Network) => {
  let bankMetadatas = devnetBankFactoryTokens

  if (isTestnet(network)) {
    bankMetadatas = testnetBankFactoryTokens
  }

  if (isMainnet(network)) {
    bankMetadatas = mainnetBankFactoryTokens
  }

  try {
    const bankFactoryTokens = []

    for (const bankMetadata of bankMetadatas) {
      bankFactoryTokens.push({
        ...untaggedSymbolMeta.Unknown,
        denom: bankMetadata.denom,
        address: bankMetadata.denom,
        decimals: bankMetadata.decimals,
        ...(bankMetadata?.symbol && { symbol: bankMetadata.symbol }),
        ...(bankMetadata?.logo && { externalLogo: bankMetadata.logo }),
        tokenType: TokenType.TokenFactory,
        tokenVerification: TokenVerification.Internal
      })
    }

    await updateJSONFile(
      `tokens/factoryTokens/${getNetworkFileName(network)}.json`,
      bankFactoryTokens
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
