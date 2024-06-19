import { updateJSONFile } from './helper/utils'
import { HttpClient } from '@injectivelabs/utils'

async function generateOFACList() {
  const response = await new HttpClient(
    'https://www.treasury.gov/ofac/downloads/sanctions/1.0/'
  ).get<{}, { data: string }>('sdn_advanced.xml')
  const result = response.data.match(/(\b0x[a-f0-9]{40}\b)/g)

  if (!result) {
    return
  }

  if (!result.length) {
    return
  }

  await updateJSONFile(
    'wallets/ofac.json',
    result.sort((a, b) => a.localeCompare(b))
  )
}

generateOFACList()
