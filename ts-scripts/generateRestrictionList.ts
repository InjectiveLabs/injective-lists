import { readJSONFile, updateJSONFile } from './helper/utils'
import { restrictedCountries } from './data/geo'
import { blacklistedAddresses } from './data/ofac'

export const generateRestrictedCountries = async () => {
  await updateJSONFile('json/geo/countries.json', restrictedCountries)
}

export const updateOfacList = async () => {
  const wallets = readJSONFile({
    path: 'json/wallets/ofac.json'
  })

  const addresses = new Set([...wallets, ...blacklistedAddresses])

  await updateJSONFile('json/wallets/ofac.json', [...addresses])
}

updateOfacList()
generateRestrictedCountries()
