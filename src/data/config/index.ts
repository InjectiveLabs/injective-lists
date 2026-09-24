import { ChainConfig } from './../../types'

const LyoraMainnetUpgrade = {
  proposalId: 518,
  blockHeight: 114590000,
  disableMaintenance: true, // set this to true after the upgrade is over to enable helix post only mode
  proposalMsg:
    'Scheduled maintenance on April 22nd, 2025 at ~13:30 UTC to implement the Injective Lyora mainnet upgrade.'
} as ChainConfig

const evmMainnetUpgrade = {
  proposalId: 541,
  blockHeight: 127250000,
  disableMaintenance: false,
  proposalMsg:
    'Scheduled maintenance on July 31st, 2025 at ~14:00 UTC to implement the Injective EVM mainnet upgrade.'
}

export const chainUpgradeConfig = {
  proposalId: 701,
  blockHeight: 184394000,
  disableMaintenance: true,
  proposalMsg:
    'Scheduled maintenance on September 24th, 2026 at ~15:00 UTC to implement the Injective Meridian Mainnet Upgrade.'
} as ChainConfig | {}
