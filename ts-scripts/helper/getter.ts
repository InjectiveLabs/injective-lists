import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  denomsToDenomMap,
  tokensToDenomMap,
  bankMetadataToDenomMap,
  bankMetadataToAddressMap
} from './../helper/utils'
import { Token, BankMetadata } from './../types'

const devnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'data/bankMetadata/devnet.json' })
)
const testnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'data/bankMetadata/testnet.json' })
)
const mainnetBankMetadataMap = bankMetadataToDenomMap(
  readJSONFile({ path: 'data/bankMetadata/mainnet.json' })
)

const devnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'data/bankMetadata/devnet.json' })
)
const testnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'data/bankMetadata/testnet.json' })
)
const mainnetBankMetadataAddressMap = bankMetadataToAddressMap(
  readJSONFile({ path: 'data/bankMetadata/mainnet.json' })
)

const devnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'data/insuranceFunds/devnet.json' })
)
const testnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'data/insuranceFunds/testnet.json' })
)
const mainnetInsuranceFundsMap = tokensToDenomMap(
  readJSONFile({ path: 'data/insuranceFunds/mainnet.json' })
)

const devnetSupplyDenomMap = denomsToDenomMap(
  readJSONFile({ path: 'data/bankSupplyDenoms/devnet.json' })
)

const testnetSupplyDenomMap = denomsToDenomMap(
  readJSONFile({ path: 'data/bankSupplyDenoms/testnet.json' })
)

const mainnetSupplyDenomMap = denomsToDenomMap(
  readJSONFile({ path: 'data/bankSupplyDenoms/mainnet.json' })
)

export const getSupplyDenom = (
  denom: string,
  network: Network
): string | undefined => {
  const formattedDenom = denom.toLowerCase()

  if (isMainnet(network)) {
    return mainnetSupplyDenomMap[formattedDenom]
  }

  if (isTestnet(network)) {
    return testnetSupplyDenomMap[formattedDenom]
  }

  return devnetSupplyDenomMap[formattedDenom]
}

export const getBankTokenFactoryMetadata = (
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

export const getBankTokenFactoryMetadataByAddress = (
  denom: string,
  network: Network
): BankMetadata | undefined => {
  const formattedDenom = denom.toLowerCase()

  if (isMainnet(network)) {
    return mainnetBankMetadataAddressMap[formattedDenom]
  }

  if (isTestnet(network)) {
    return testnetBankMetadataAddressMap[formattedDenom]
  }

  return devnetBankMetadataAddressMap[formattedDenom]
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
