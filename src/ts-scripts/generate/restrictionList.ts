import { readJSONFile, updateJSONFile } from '../helper/utils'
import { restrictedCountries } from '../../data/restriction/geo'
import { restrictedAddresses } from '../../data/restriction/addresses'

export const generateRestrictedCountries = async () => {
  await updateJSONFile('json/geo/countries.json', restrictedCountries)
}

export const updateOfacList = async () => {
  const ofacAddresses = readJSONFile({
    path: 'json/wallets/ofac.json'
  })

  await updateJSONFile('json/wallets/restricted.json', restrictedAddresses)
  await updateJSONFile('json/wallets/ofacAndRestricted.json', [
    ...new Set([...ofacAddresses, ...restrictedAddresses])
  ])
}

updateOfacList()
generateRestrictedCountries()
