import 'dotenv/config'
import { HttpRestClient } from '@injectivelabs/utils'
import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from './helper/utils'

const keybaseApi = new HttpRestClient('https://keybase.io/_/api/1.0/user')

export const fetchValidatorMetadataFromKeybase = async (identity: string) => {
  try {
    const response = (await keybaseApi.get(
      `lookup.json?fields=pictures&key_suffix=${identity}`
    )) as {
      data: any
    }

    return response.data.them?.[0]
  } catch (e) {
    console.log(`cannot fetch validator logo ${identity}:`, e)
  }
}

export const fetchValidatorMetadata = async ({
  network,
  identity,
  operatorAddress
}: {
  network: Network
  identity: string
  operatorAddress: string
}) => {
  let existingValidatorsImageMap = readJSONFile({
    path: 'data/validatorMetadata/devnet.json',
    fallback: {}
  })

  if (isTestnet(network)) {
    existingValidatorsImageMap = readJSONFile({
      path: 'data/validatorMetadata/testnet.json',
      fallback: {}
    })
  }

  if (isMainnet(network)) {
    existingValidatorsImageMap = readJSONFile({
      path: 'data/validatorMetadata/mainnet.json',
      fallback: {}
    })
  }

  const existingValidatorImage =
    existingValidatorsImageMap[operatorAddress.toLowerCase()]

  if (existingValidatorImage) {
    return existingValidatorImage
  }

  const validatorMetadata =
    (await fetchValidatorMetadataFromKeybase(identity)) || {}

  await updateJSONFile(
    `data/validatorMetadata/${getNetworkFileName(network)}.json`,
    {
      ...existingValidatorsImageMap,
      [operatorAddress.toLowerCase()]: validatorMetadata
    }
  )

  return validatorMetadata
}
