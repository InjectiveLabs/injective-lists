import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import { cw20TokensToDenomMap, bankMetadataToDenomMap } from './../helper/utils'
import * as devnetMetadata from '../../tokens/bankMetadata/devnet.json'
import * as mainnetMetadata from '../../tokens/bankMetadata/mainnet.json'
import * as testnetMetadata from '../../tokens/bankMetadata/testnet.json'
import * as testnetCw20ContractInfo from '../../tokens/cw20TokenMeta/testnet.json'
import * as mainnetCw20ContractInfo from '../../tokens/cw20TokenMeta/mainnet.json'
import { Token, BankMetadata } from './../types'

const devnetBankMetadataMap = bankMetadataToDenomMap(devnetMetadata)
const mainnetBankMetadataMap = bankMetadataToDenomMap(mainnetMetadata)
const testnetBankMetadataMap = bankMetadataToDenomMap(testnetMetadata)

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
