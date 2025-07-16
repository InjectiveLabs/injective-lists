import 'dotenv/config'
import { HttpRestClient } from '@injectivelabs/utils'
import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'
import { readJSONFile, updateJSONFile, getNetworkFileName } from './utils'

const keybaseApi = new HttpRestClient('https://keybase.io/_/api/1.0/user')

const validatorImagePathsMap = Object.entries(
  readJSONFile({
    path: 'src/data/validatorImagePaths.json',
    fallback: {}
  })
).reduce((acc, [operatorAddress, imageUrl]) => {
  const formattedOperatorAddress = operatorAddress.split('.')[0].toLowerCase()

  return { ...acc, [formattedOperatorAddress]: imageUrl as string }
}, {} as Record<string, string>)

export const fetchValidatorImageFromImagePaths = (operatorAddress: string) => {
  return validatorImagePathsMap[operatorAddress.toLowerCase()]
}

export const fetchValidatorMetadataFromKeybase = async (identity?: string) => {
  if (!identity) {
    return
  }

  try {
    const response = (await keybaseApi.get(
      `lookup.json?fields=pictures&key_suffix=${identity}`
    )) as {
      data: any
    }

    return response.data.them?.[0]?.pictures?.primary?.url
  } catch (e) {
    console.log(`cannot fetch validator logo ${identity}:`, e)
  }
}

export const fetchValidatorImage = async ({
  network,
  identity,
  operatorAddress
}: {
  network: Network
  identity: string
  operatorAddress: string
}) => {
  let existingValidatorsImageMap = readJSONFile({
    path: 'src/generated/validatorImageMap/devnet.json',
    fallback: {}
  })

  if (isTestnet(network)) {
    existingValidatorsImageMap = readJSONFile({
      path: 'src/generated/validatorImageMap/testnet.json',
      fallback: {}
    })
  }

  if (isMainnet(network)) {
    existingValidatorsImageMap = readJSONFile({
      path: 'src/generated/validatorImageMap/mainnet.json',
      fallback: {}
    })
  }

  const cloudFlareImageUrl = fetchValidatorImageFromImagePaths(operatorAddress)

  if (cloudFlareImageUrl) {
    return cloudFlareImageUrl
  }

  const existingValidatorImage =
    existingValidatorsImageMap[operatorAddress.toLowerCase()]

  if (existingValidatorImage) {
    return existingValidatorImage
  }

  const validatorMetadata =
    (await fetchValidatorMetadataFromKeybase(identity)) || ''

  await updateJSONFile(
    `src/generated/validatorImageMap/${getNetworkFileName(network)}.json`,
    {
      ...existingValidatorsImageMap,
      [operatorAddress.toLowerCase()]: validatorMetadata
    }
  )

  return validatorMetadata
}
