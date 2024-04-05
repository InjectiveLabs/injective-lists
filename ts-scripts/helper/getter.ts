import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import * as devnetMetadata from '../../tokens/bankMetadata/devnet.json'
import * as mainnetMetadata from '../../tokens/bankMetadata/mainnet.json'
import * as testnetMetadata from '../../tokens/bankMetadata/testnet.json'
import * as devnetInsuranceFunds from '../../tokens/insuranceFunds/devnet.json'
import * as testnetInsuranceFunds from '../../tokens/insuranceFunds/testnet.json'
import * as mainnetInsuranceFunds from '../../tokens/insuranceFunds/mainnet.json'
import * as testnetCw20ContractInfo from '../../tokens/cw20TokenMeta/testnet.json'
import * as mainnetCw20ContractInfo from '../../tokens/cw20TokenMeta/mainnet.json'
import {
  tokensToDenomMap,
  cw20TokensToDenomMap,
  bankMetadataToDenomMap
} from './../helper/utils'
import { Token, BankMetadata } from './../types'

const devnetBankMetadataMap = bankMetadataToDenomMap(devnetMetadata)
const testnetBankMetadataMap = bankMetadataToDenomMap(testnetMetadata)
const mainnetBankMetadataMap = bankMetadataToDenomMap(mainnetMetadata)

const devnetInsuranceFundsMap = tokensToDenomMap(devnetInsuranceFunds)
const testnetInsuranceFundsMap = tokensToDenomMap(testnetInsuranceFunds)
const mainnetInsuranceFundsMap = tokensToDenomMap(mainnetInsuranceFunds)

const testnetCw20ContractInfoMap = cw20TokensToDenomMap(testnetCw20ContractInfo)
const mainnetCw20ContractInfoMap = cw20TokensToDenomMap(mainnetCw20ContractInfo)

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

export const getCw20TokenMetadata = (
  denom: string,
  network: Network
): Token | undefined => {
  const formattedDenom = denom.toLowerCase()

  if (isMainnet(network)) {
    return mainnetCw20ContractInfoMap[formattedDenom]
  }

  if (isTestnet(network)) {
    return testnetCw20ContractInfoMap[formattedDenom]
  }

  return
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
