import { updateJSONFile } from '../helper/utils'
import { HttpClient } from '@injectivelabs/utils'
import { restrictedAddresses } from '../../data/restriction/addresses'

async function generateOFACList() {
  const response = await new HttpClient(
    'https://www.treasury.gov/ofac/downloads/sanctions/1.0/'
  ).get<{}, { data: string }>('sdn_advanced.xml')
  const rawResults = response.data.match(/(\b0x[a-fA-F0-9]{40}\b)/g)
  const result = rawResults
    ? [...new Set(rawResults.map((address) => address.toLowerCase()))]
    : []

  if (!result) {
    return
  }

  if (!result.length) {
    return
  }

  const ofacAddresses = new Set([...result.sort((a, b) => a.localeCompare(b))])

  await updateJSONFile('json/wallets/ofac.json', [...ofacAddresses])
  await updateJSONFile('json/wallets/ofacAndRestricted.json', [
    ...new Set([...ofacAddresses, ...restrictedAddresses])
  ])
}

generateOFACList()
