import { updateJSONFile } from '../helper/utils'
import { chainUpgradeConfig } from '../../data/config'

export const generateConfigs = async () => {
  await updateJSONFile('json/config/chainUpgrade.json', chainUpgradeConfig)
}

generateConfigs()
