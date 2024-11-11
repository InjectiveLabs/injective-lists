import { updateJSONFile } from './helper/utils'
import { HttpClient } from '@injectivelabs/utils'
import { blacklistedAddresses } from './data/ofac'

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

  await updateJSONFile('json/wallets/ofac.json', [
    ...result.sort((a, b) => a.localeCompare(b)),
    ...blacklistedAddresses
  ])
}

generateOFACList()
