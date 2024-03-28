import { writeFileSync } from 'node:fs'
import { HttpRestClient } from '@injectivelabs/utils'
import * as bankMetadata from '../bankMetadata.json'
import { BankMetadata } from '../tokens/type'

interface DenomUnit {
  denom: string
  exponent: number
  aliases: string[]
}

interface Metadata {
  description: string
  denom_units: DenomUnit[]
  base: string
  display: string
  name: string
  symbol: string
  uri: string
  uriHash: string
}

const bankApi = new HttpRestClient(
  'https://lcd.injective.network/cosmos/bank/v1beta1/',
  {
    timeout: 20000
  }
)

export const getMetadata = (denom: string): BankMetadata | undefined =>
  bankMetadata.find((metadata) => metadata.denom === denom)

const formatMetadata = (metadata: Metadata) => {
  return {
    logo: metadata.uri,
    name: metadata.name,
    denom: metadata.base,
    symbol: metadata.symbol,
    display: metadata.display,
    description: metadata.description,
    decimals: metadata.denom_units.pop()?.exponent || 0
  }
}

export const fetchMetadata = async () => {
  try {
    const response = (await bankApi.get(
      'denoms_metadata?pagination.limit=5000'
    )) as {
      data: { metadatas: Metadata[] }
    }

    // cache bank metadata in case of api error
    writeFileSync(
      'bankMetadata.json',
      JSON.stringify(response.data.metadatas.map(formatMetadata), null, 2)
    )
  } catch (e) {
    console.log('Error fetching bank metadata: ', e)
  }
}
