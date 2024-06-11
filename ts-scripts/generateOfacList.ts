import { execShellCommand } from './helper/execShellCommand'

async function generateOFACList() {
  await execShellCommand(
    'wget https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml'
  )
  await execShellCommand(
    'python3 ./ofac/generate-address-list.py ETH -f JSON -sdn sdn_advanced.xml'
  )
  await execShellCommand(
    'mv sanctioned_addresses_ETH.json ../wallets/ofac.json'
  )
  await execShellCommand('rm sdn_advanced.xml')
}

generateOFACList()
