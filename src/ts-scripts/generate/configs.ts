import { updateJSONFile } from '../helper/utils'
import { olpConfig } from '../../data/config/olp'
import { chainUpgradeConfig } from '../../data/config'

export const generateConfigs = async () => {
  await updateJSONFile('json/config/chainUpgrade.json', chainUpgradeConfig)
}

export const generateOlpConfig = async () => {
  await updateJSONFile('json/config/olp.json', olpConfig)
}

generateConfigs()
generateOlpConfig()
