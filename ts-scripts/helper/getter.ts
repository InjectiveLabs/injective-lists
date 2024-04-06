import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import {
  tokensToDenomMap,
  bankMetadataToDenomMap,
  readJSONFile
} from './../helper/utils'
import { Token, BankMetadata } from './../types'

const devnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'tokens/bankMetadata/devnet.json' })
)
const testnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'tokens/bankMetadata/testnet.json' })
)
const mainnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'tokens/bankMetadata/mainnet.json' })
)

const devnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/insuranceFunds/devnet.json' })
)
const testnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/insuranceFunds/testnet.json' })
)
const mainnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'tokens/insuranceFunds/mainnet.json' })
)

export const getChainTokenMetadata = (
  denom: string,
  network: Network
): BankMetadata | undefined => {
  const formattedDenom = denom.toLowerCase()

  if (isMainnet(network)) {
    return mainnetBankMetadataMap[formattedDenom]
  }

  if (isTestnet(network)) {
    return testnetBankMetadataMap[formattedDenom]
  }

  return devnetBankMetadataMap[formattedDenom]
}

export const getInsuranceFundToken = (
  denom: string,
  network: Network
): Token | undefined => {
  const formattedDenom = denom.toLowerCase()

  if (isMainnet(network)) {
    return mainnetInsuranceFundsMap[formattedDenom]
  }

  if (isTestnet(network)) {
    return testnetInsuranceFundsMap[formattedDenom]
  }

  return devnetInsuranceFundsMap[formattedDenom]
}
