import { execShellCommand } from './helper/execShellCommand'

async function generateOFACList() {
  const commands = [
    'wget https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml',
    'python3 ./ofac/generate-address-list.py ETH -f JSON -sdn sdn_advanced.xml',
    'mv sanctioned_addresses_ETH.json ../wallets/ofac.json',
    'rm sdn_advanced.xml'
  ]

  for (const command of commands) {
    await execShellCommand(command)
  }
}

generateOFACList()
