import { Network, isMainnet, isTestnet } from '@injectivelabs/networks'
import {
  readJSONFile,
  updateJSONFile,
  getNetworkFileName
} from '../helper/utils'
import { fetchValidatorImage } from '../helper/fetchValidatorImage'

const mainnetValidators = readJSONFile({
  path: 'src/cache/validators/mainnet.json'
})

const devnetValidators = readJSONFile({
  path: 'src/cache/validators/devnet.json'
})

const testnetValidators = readJSONFile({
  path: 'src/cache/validators/testnet.json'
})

// Helper function to split array into batches
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export const generateValidatorsData = async (network: Network) => {
  let validators = devnetValidators

  if (isTestnet(network)) {
    validators = testnetValidators
  }

  if (isMainnet(network)) {
    validators = mainnetValidators
  }

  try {
    const validatorSources = []

    // Split validators into batches of 10
    const batches = chunkArray(validators, 10)

    // Process each batch in parallel
    for (const batch of batches) {
      const batchPromises = batch.map(async (validator: any) => {
        const {
          operatorAddress,
          description: { identity, moniker }
        } = validator

        const validatorImageUrl = await fetchValidatorImage({
          network,
          identity,
          operatorAddress
        })

        return {
          moniker,
          identity,
          operatorAddress,
          image: validatorImageUrl
        }
      })

      // Wait for all validators in this batch to complete
      const batchResults = await Promise.all(batchPromises)

      validatorSources.push(...batchResults)
    }

    await updateJSONFile(
      `json/validators/${getNetworkFileName(network)}.json`,
      validatorSources
    )

    console.log(`✅✅✅ GenerateValidatorsData ${network}`)
  } catch (e) {
    console.log('Error generating validators data:', e)
  }
}

generateValidatorsData(Network.Devnet)
generateValidatorsData(Network.TestnetSentry)
generateValidatorsData(Network.MainnetSentry)
