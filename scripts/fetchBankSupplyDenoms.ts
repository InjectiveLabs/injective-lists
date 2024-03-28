import { writeFileSync } from 'node:fs'
import { HttpRestClient } from '@injectivelabs/utils'

interface Coin {
  denom: string
  amount: string
}

const bankApi = new HttpRestClient(
  'https://lcd.injective.network/cosmos/bank/v1beta1/',
  {
    timeout: 20000
  }
)

export const fetchSupplyDenoms = async () => {
  try {
    const response = (await bankApi.get('supply?pagination.limit=5000')) as {
      data: { supply: Coin[] }
    }

    // cache bank supply denoms in case of api error
    writeFileSync(
      'bankSupplyDenoms.json',
      JSON.stringify(
        response.data.supply.map(({ denom }) => denom),
        null,
        2
      )
    )
  } catch (e) {
    console.log('Error fetching bank supply: ', e)
  }
}
