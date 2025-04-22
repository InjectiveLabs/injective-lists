import { ChainConfig } from './../../types'

const template = {
  proposalId: 515,
  blockHeight: 111949209,
  disableMaintenance: false,
  proposalMsg:
    'Scheduled maintenance on January 11th, 2024 at ~14:00 UTC to implement the Injective Volan mainnet upgrade.'
} as ChainConfig

export const chainUpgradeConfig = {
  proposalId: 518,
  blockHeight: 114590000,
  disableMaintenance: true,
  proposalMsg:
    'Scheduled maintenance on April 22nd, 2025 at ~13:30 UTC to implement the Injective Lyora mainnet upgrade.'
} as ChainConfig | {}
