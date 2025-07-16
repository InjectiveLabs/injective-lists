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

    for (const validator of validators) {
      const {
        operatorAddress,
        description: { identity, moniker }
      } = validator

      const validatorImageUrl = await fetchValidatorImage({
        network,
        identity,
        operatorAddress
      })

      validatorSources.push({
        moniker,
        identity,
        operatorAddress,
        image: validatorImageUrl
      })
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
generateValidatorsData(Network.MainnetSentry)
generateValidatorsData(Network.TestnetSentry)
