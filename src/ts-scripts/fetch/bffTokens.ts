import axios from 'axios'
import { updateJSONFile, getNetworkFileName } from './../helper/utils'
import { Network } from '@injectivelabs/networks'

const BASE_URL = 'https://staging.bff-api.injective.network/api/v1/tokens'
const PAGE_LIMIT = 1000
const MAX_RETRIES = 5
const INITIAL_DELAY = 3000
const BATCH_CONCURRENCY = 10
const REQUEST_TIMEOUT = 30000

interface BFFTokenResponse {
  data: any[]
  pagination: { total: number }
  error?: string
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  maxRetries = MAX_RETRIES
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error

      const delay = INITIAL_DELAY * Math.pow(2, attempt)
      console.error(
        `  Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`
      )
      await sleep(delay)
    }
  }

  throw new Error('Max retries exceeded')
}

const fetchPage = async (
  network: Network,
  page: number
): Promise<BFFTokenResponse> => {
  const url = `${BASE_URL}?network=${network}&page=${page}&limit=${PAGE_LIMIT}`
  const { data } = await axios.get<BFFTokenResponse>(url, {
    timeout: REQUEST_TIMEOUT
  })

  if (data.error) throw new Error(data.error)
  if (!Array.isArray(data.data))
    throw new Error(`Invalid response format for ${url}`)

  return data
}

const fetchAllTokens = async (network: Network): Promise<any[]> => {
  console.log(`Fetching ${network} tokens from BFF...`)

  const firstPage = await fetchWithRetry(() => fetchPage(network, 1))
  const { total } = firstPage.pagination
  const totalPages = Math.ceil(total / PAGE_LIMIT)
  const tokens = [...firstPage.data]

  console.log(`  Total tokens: ${total}`)

  if (totalPages <= 1) return tokens

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

  for (let i = 0; i < remainingPages.length; i += BATCH_CONCURRENCY) {
    const batch = remainingPages.slice(i, i + BATCH_CONCURRENCY)
    console.log(
      `  Fetching pages ${batch[0]}-${batch[batch.length - 1]}/${totalPages}...`
    )

    const results = await Promise.allSettled(
      batch.map((page) => fetchWithRetry(() => fetchPage(network, page)))
    )

    for (const [j, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        tokens.push(...result.value.data)
        console.log(
          `    ✓ Page ${batch[j]}: ${result.value.data.length} tokens`
        )
      } else {
        throw new Error(
          `Failed to fetch page ${batch[j]}: ${result.reason.message}`
        )
      }
    }
  }

  if (tokens.length !== total) {
    throw new Error(
      `Token count mismatch: expected ${total} tokens but got ${tokens.length}`
    )
  }

  console.log(`  ✓ Fetched ${tokens.length} ${network} tokens`)
  return tokens
}

export const fetchBFFTokens = async (network: Network): Promise<void> => {
  try {
    const tokens = await fetchAllTokens(network)
    const filePath = `json/tokens/bff/${getNetworkFileName(network)}.json`

    await updateJSONFile(filePath, tokens)
    console.log(`  ✓ ${network}: ${tokens.length} tokens → ${filePath}`)
  } catch (error: any) {
    console.error(`Error fetching ${network} tokens:`, error.message)
    throw error
  }
}

const main = async (): Promise<void> => {
  const networks: Network[] = [Network.Mainnet, Network.Testnet]

  console.log('Starting BFF token fetch...')

  const results = await Promise.allSettled(networks.map(fetchBFFTokens))

  const hasFailures = results.some((result) => result.status === 'rejected')

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Failed to fetch ${networks[i]} tokens:`, result.reason)
    }
  })

  if (hasFailures) {
    process.exit(1)
  }

  console.log('Done!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
