import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { Network } from '@injectivelabs/networks'
import { Alchemy } from 'alchemy-sdk'
import { HttpRestClient } from '@injectivelabs/utils'
import { ChainGrpcBankApi, ChainGrpcErc20Api, ChainGrpcTokenFactoryApi, ChainGrpcWasmApi, ChainGrpcIbcApi, TokenType } from '@injectivelabs/sdk-ts'
import { readJSONFile, updateJSONFile } from './helper/utils'
import { filterCuratedCw20Denoms, getCuratedBankDenoms, getStaticTokenSources } from './helper/staticTokenSources'
import { untaggedSymbolMeta } from '../data/tokens/untaggedSymbolMeta'
import { devnetHardcodedCw20Denoms } from '../data/tokens/cw20'
import { mainnetMarketIds, testnetMarketIds, devnetMarketIds } from '../data/market/spot'
import type { Token } from '../types'

// Exercise real file generation in an isolated copy; never change checked-in data.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
if (!process.argv.includes('--fixture')) {
  const fixture = mkdtempSync(join(tmpdir(), 'curated-tokens-'))
  try {
    for (const path of ['src/ts-scripts', 'src/data', 'src/cache', 'src/generated', 'src/types', 'src/package.json', '.gitignore', 'json', 'tokens']) {
      cpSync(join(root, path), join(fixture, path), { recursive: true })
    }
    symlinkSync(join(root, 'src/node_modules'), join(fixture, 'src/node_modules'), 'dir')
    execFileSync(process.execPath, ['--import', 'tsx', 'ts-scripts/checkCuratedTokens.ts', '--fixture'], { cwd: join(fixture, 'src'), stdio: 'inherit' })
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
} else {
  await check()
}

async function check() {
  let firstPass: string[] = []
  const forbiddenQueries: string[] = []
  const networks = [Network.Devnet, Network.TestnetSentry]
  const names = ['devnet', 'testnet']
  const read = (path: string) => readJSONFile({ path })
  const bytes = (path: string) => readFileSync(join(root, path), 'utf8')
  const generate = () => {
    for (const script of ['generate/tokens/staticTokens', 'generate/tokens', 'generate/tokens/verifiedTokens', 'generate/verifiedDenoms']) {
      execFileSync(process.execPath, ['--import', 'tsx', `ts-scripts/${script}.ts`], { cwd: join(root, 'src'), stdio: 'pipe' })
    }
  }
  const mainnetPaths = ['src/generated/tokens/staticTokens/mainnet.json', 'json/tokens/mainnet.json', 'tokens/mainnet.json', 'json/tokens/verified/mainnet.json', 'json/helix/trading/denoms/mainnet.json']
  const mainnetBefore = mainnetPaths.map(bytes)
  const externalSourcePath = 'src/cache/externalTokensSource.json'
  const externalOutputPath = 'src/generated/tokens/externalTokens.json'
  const externalOriginals = new Map([externalSourcePath, externalOutputPath].map(path => [path, bytes(path)]))
  const originalGet = HttpRestClient.prototype.get
  let httpRequests = 0
  HttpRestClient.prototype.get = async () => {
    httpRequests++
    throw new Error('External tokens must not contact TFM')
  }
  try {
    const cachedToken = {
      contractAddr: 'factory/inj-cached/external-test',
      name: 'Cached external token', symbol: 'CACHED', decimals: 6,
      imageUrl: 'https://example.com/cached.png', numberOfPools: 1, isTrading: true
    }
    updateJSONFile(externalSourcePath, [cachedToken, cachedToken, { ...cachedToken, contractAddr: 'inj' }])
    const sourceBefore = bytes(externalSourcePath)
    await import('./generate/tokens/externalTokens')
    await new Promise<void>(resolve => setImmediate(resolve))
    assert.equal(httpRequests, 0)
    assert.equal(bytes(externalSourcePath), sourceBefore)
    assert.deepEqual(read(externalOutputPath), [{
      ...untaggedSymbolMeta.Unknown,
      denom: cachedToken.contractAddr,
      address: cachedToken.contractAddr,
      name: cachedToken.name,
      symbol: cachedToken.symbol,
      decimals: cachedToken.decimals,
      externalLogo: cachedToken.imageUrl,
      tokenType: TokenType.TokenFactory,
      tokenVerification: 'unverified'
    }])
  } finally {
    HttpRestClient.prototype.get = originalGet
    for (const [path, data] of externalOriginals) writeFileSync(join(root, path), data)
  }
  const zeroDecimalCases = ['mainnet', ...names].map(name => ({
    name,
    token: (read(`src/generated/tokens/staticTokens/${name}.json`) as Token[])
      .find(token => token.tokenType === TokenType.Cw20 && token.decimals > 0)!
  }))
  const originals = new Map(zeroDecimalCases.flatMap(({ name }) => [
    `src/cache/bankMetadata/${name}.json`,
    `src/generated/tokens/staticTokens/${name}.json`
  ]).map(path => [path, bytes(path)]))
  try {
    for (const { name, token } of zeroDecimalCases) {
      assert(token, `${name} needs a CW20 fixture with positive curated decimals`)
      const path = `src/cache/bankMetadata/${name}.json`
      const metadata = read(path)
      updateJSONFile(path, [
        { ...(metadata.find((entry: any) => entry.denom === token.denom) || token), decimals: 0 },
        ...metadata.filter((entry: any) => entry.denom !== token.denom)
      ])
    }
    execFileSync(process.execPath, ['--import', 'tsx', 'ts-scripts/generate/tokens/staticTokens.ts'], { cwd: join(root, 'src'), stdio: 'pipe' })
    for (const { name, token } of zeroDecimalCases) {
      const factory = read(`src/generated/tokens/staticTokens/${name}.json`)
        .find((entry: Token) => entry.denom === token.denom && entry.tokenType === TokenType.TokenFactory)
      assert.equal(factory.decimals, name === 'mainnet' ? token.decimals : 0, `${name} bank decimals fallback`)
    }
  } finally {
    for (const [path, data] of originals) writeFileSync(join(root, path), data)
  }
  const unknown = 'factory/inj-unapproved/unknown'
  const nbz = 'factory/inj1llr45x92t7jrqtxvc02gpkcqhqr82dvyzkr4mz/nbz'
  const otherNbz = nbz.replace('/nbz', '/NBZ')
  const cw20 = `factory/adapter/${getStaticTokenSources(Network.TestnetSentry).cw20[0].address}`
  const approvedCw20 = filterCuratedCw20Denoms([cw20, ...read('src/cache/cw20Denoms/testnet.json')], Network.TestnetSentry)
  let offline = false
  let currentApproved = new Set<string>()
  const { fetchCuratedTokenMappings, fetchInsuranceFunds, fetchSupplyDenoms, fetchBankMetadata } = await import('./fetch/cacheData')

  ChainGrpcTokenFactoryApi.prototype.fetchDenomsFromCreator = async () => {
    if (offline) throw new Error('mock adapter outage')
    return [...approvedCw20, cw20, unknown]
  }
  ChainGrpcBankApi.prototype.fetchSupplyOf = async (denom) => {
    if (!currentApproved.has(denom.toLowerCase())) forbiddenQueries.push(denom)
    if (offline || denom === 'inj') throw new Error('mock missing supply')
    return { denom: denom === nbz ? otherNbz : denom, amount: '1' }
  }
  ChainGrpcBankApi.prototype.fetchDenomMetadata = async (denom) => {
    if (!currentApproved.has(denom.toLowerCase())) forbiddenQueries.push(denom)
    if (offline || (!denom.startsWith('erc20:') && denom !== nbz)) throw new Error('mock optional metadata missing')
    return { base: denom === nbz ? otherNbz : denom, decimals: 0, name: 'Bank name', symbol: 'BANK', display: '', description: '', uri: '', uriHash: '', denomUnits: [{ denom, exponent: 0, aliases: [] }] }
  }
  ChainGrpcBankApi.prototype.fetchAllTotalSupply = async () => { forbiddenQueries.push('supply enumeration'); throw new Error('forbidden') }
  ChainGrpcBankApi.prototype.fetchDenomsMetadata = async () => { forbiddenQueries.push('bank enumeration'); throw new Error('forbidden') }

  // Case-sensitive assets must keep the original first-match casing, even offline.
  currentApproved = new Set(getCuratedBankDenoms(Network.TestnetSentry, approvedCw20).map(d => d.toLowerCase()))
  updateJSONFile('src/cache/bankSupplyDenoms/testnet.json', [nbz, otherNbz])
  updateJSONFile('src/cache/bankMetadata/testnet.json', [
    { denom: nbz, name: 'Curated NBZ', decimals: 6 },
    { denom: otherNbz, name: 'Different asset', decimals: 18 }
  ])
  for (const unavailable of [true, false]) {
    offline = unavailable
    await fetchSupplyDenoms(Network.TestnetSentry)
    await fetchBankMetadata(Network.TestnetSentry)
    const supply = read('src/cache/bankSupplyDenoms/testnet.json')
    assert(supply.includes(nbz))
    assert(!supply.includes(otherNbz))
    assert.deepEqual(read('src/cache/bankMetadata/testnet.json').filter((t: any) => t.denom.toLowerCase() === nbz), [
      { denom: nbz, name: 'Curated NBZ', decimals: 6 }
    ])
  }
  generate()
  assert(read('json/tokens/testnet.json').some((t: Token) => t.denom === nbz && t.decimals === 6))
  assert(!read('json/tokens/testnet.json').some((t: Token) => t.denom === otherNbz))

  for (const [i, network] of networks.entries()) {
    const n = names[i]
    updateJSONFile(`src/cache/cw20Denoms/${n}.json`, [cw20, unknown])
    const denoms = getCuratedBankDenoms(network, [...approvedCw20, ...(n === 'devnet' ? devnetHardcodedCw20Denoms : [])])
    currentApproved = new Set(denoms.map(d => d.toLowerCase()))
    updateJSONFile(`src/cache/bankSupplyDenoms/${n}.json`, ['inj', unknown, ...denoms.filter(d => d.startsWith('erc20:'))])
    updateJSONFile(`src/cache/bankMetadata/${n}.json`, [{ denom: 'inj', decimals: 0 }, { denom: unknown, decimals: 18 }])
    await fetchCuratedTokenMappings(network)
    assert.deepEqual(read(`src/cache/cw20Denoms/${n}.json`), approvedCw20)
    for (const kind of ['bankMetadata', 'bankSupplyDenoms']) {
      const entries = read(`src/cache/${kind}/${n}.json`)
      const cachedDenoms = entries.map((v: any) => typeof v === 'string' ? v : v.denom)
      assert(cachedDenoms.every((d: string) => currentApproved.has(d.toLowerCase())))
      assert.equal(new Set(cachedDenoms).size, cachedDenoms.length)
    }
    assert.equal(read(`src/cache/bankMetadata/${n}.json`).find((v: any) => v.denom === 'inj').decimals, 0)
    const before = ['cw20Denoms', 'bankMetadata', 'bankSupplyDenoms'].map(kind => bytes(`src/cache/${kind}/${n}.json`))
    offline = true
    await fetchCuratedTokenMappings(network)
    assert.deepEqual(['cw20Denoms', 'bankMetadata', 'bankSupplyDenoms'].map(kind => bytes(`src/cache/${kind}/${n}.json`)), before)
    offline = false
  }
  assert.deepEqual(filterCuratedCw20Denoms([unknown, cw20, cw20], Network.TestnetSentry), [cw20])
  for (const n of names) {
    updateJSONFile(`src/generated/tokens/factoryTokens/${n}.json`, [{ denom: unknown }])
  }
  generate()

  for (const [i, network] of networks.entries()) {
    const n = names[i]
    const tokens: Token[] = read(`json/tokens/${n}.json`)
    const staticTokens: Token[] = read(`src/generated/tokens/staticTokens/${n}.json`)
    const denoms = new Set(tokens.map(t => t.denom))
    assert.equal(denoms.size, tokens.length)
    assert.deepEqual([...denoms].sort(), [...new Set(staticTokens.map(t => t.denom))].sort())
    assert(tokens.some(t => t.denom === 'inj' && t.isNative && t.decimals === 18))
    for (const meta of Object.values(untaggedSymbolMeta)) assert(denoms.has(meta.symbol.toLowerCase()))
    assert(!denoms.has(unknown))
    rmSync(join(root, `src/generated/tokens/factoryTokens/${n}.json`))
    assert(tokens.some(t => t.denom === cw20 && t.tokenType === TokenType.Cw20))
    assert(tokens.some(t => t.tokenVerification === 'unverified'))
    const zen = tokens.find(t => t.denom === 'factory/inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z/uzen')!
    assert.equal(zen.decimals, 0)
    assert.deepEqual(read(`tokens/${n}.json`), tokens)
    assert(read(`json/tokens/verified/${n}.json`).every((t: Token) => denoms.has(t.denom)))
    const helix = read(`json/helix/trading/denoms/${n}.json`)
    const ids = [...mainnetMarketIds, ...(n === 'devnet' ? devnetMarketIds : testnetMarketIds)]
    for (const m of read(`src/cache/market/spot/${n}.json`).filter((m: any) => ids.includes(m.marketId))) {
      for (const d of [m.baseDenom, m.quoteDenom]) assert(helix[d], `${n} ${m.ticker}: missing ${d}`)
    }
    assert(Object.values(helix).every((t: any) => denoms.has(t.denom)))
    // Snapshots keep every field, even when pruning all other records.
    const snapshot = { ...zen, network: n, denomUnits: [], isActive: true }
    if (n === 'testnet') updateJSONFile(`json/tokens/bff/${n}.json`, [snapshot, { denom: unknown }])
    updateJSONFile(`json/tokens/mito/${n}.json`, [{ denom: unknown, marketId: [] }])
    updateJSONFile(`src/cache/evmTokenPairs/${n}.json`, [{ bankDenom: zen.denom, erc20Address: '0xcached' }, { bankDenom: unknown, erc20Address: '0xbad' }, { bankDenom: otherNbz, erc20Address: '0xwrong-case' }])
  }

  // A stale final file must not expand EVM lookups either.
  updateJSONFile('json/tokens/testnet.json', [...read('json/tokens/testnet.json'), { denom: unknown, tokenType: TokenType.TokenFactory }])
  const { generateEvmTokensFromMTSPairs } = await import('./generate/evm')
  ChainGrpcErc20Api.prototype.fetchAllTokenPairsWithPagination = async () => { forbiddenQueries.push('pair enumeration'); throw new Error('forbidden') }
  ChainGrpcErc20Api.prototype.fetchTokenPairByDenom = async denom => {
    if (!currentApproved.has(denom.toLowerCase())) forbiddenQueries.push(denom)
    if (denom === nbz) throw new Error('mock pair outage')
    if (denom.endsWith('/uzen')) throw new Error('mock pair outage')
    if (denom === cw20) return { bankDenom: cw20.toUpperCase(), erc20Address: '0xwrong-response' }
    if (denom.startsWith('erc20:')) return { bankDenom: denom, erc20Address: denom.slice(6) }
    return undefined
  }
  for (let pass = 0; pass < 2; pass++) {
    generate()
    for (const [i, network] of networks.entries()) {
      const n = names[i]
      currentApproved = new Set(read(`json/tokens/${n}.json`).filter((t: Token) => t.tokenType !== TokenType.Symbol).map((t: Token) => t.denom.toLowerCase()))
      await generateEvmTokensFromMTSPairs(network)
      const pairs = read(`src/cache/evmTokenPairs/${n}.json`)
      assert(pairs.every((p: any) => currentApproved.has(p.bankDenom.toLowerCase())))
      const evm = read(`json/tokens/evm/${n}.json`)
      assert(evm.some((t: any) => t.address === '0xcached' && t.decimals === 0))
      assert(evm.some((t: any) => t.name === 'Bank name' && t.symbol === 'BANK' && t.decimals === 0))
      assert(!evm.some((t: any) => t.address === '0xbad'))
      assert(!evm.some((t: any) => ['0xwrong-case', '0xwrong-response'].includes(t.address)))
      assert.deepEqual(read(`json/tokens/mito/${n}.json`), [])
    }
    const snapshot = read('json/tokens/bff/testnet.json')
    assert.equal(snapshot.length, 1)
    assert.equal(snapshot[0].isActive, true)
    assert.deepEqual(snapshot[0].denomUnits, [])
    assert(!existsSync(join(root, 'json/tokens/bff/devnet.json')))
    const paths = names.flatMap(n => [`json/tokens/${n}.json`, `tokens/${n}.json`, `json/tokens/verified/${n}.json`, `json/tokens/evm/${n}.json`, `json/helix/trading/denoms/${n}.json`, `src/cache/evmTokenPairs/${n}.json`])
    if (pass === 0) firstPass = paths.map(bytes)
    else assert.deepEqual(paths.map(bytes), firstPass)
  }
  const { pruneTokenSnapshots } = await import('./helper/tokenSnapshots')
  const snapshot = { denom: 'inj', marketId: ['market'], address: 'vault', tokenType: 'lp' }
  updateJSONFile('json/tokens/mito/testnet.json', [snapshot, { denom: unknown }])
  pruneTokenSnapshots(Network.TestnetSentry, read('json/tokens/testnet.json'))
  assert.deepEqual(read('json/tokens/mito/testnet.json'), [snapshot])
  updateJSONFile('json/tokens/bff/testnet.json', [{ denom: unknown }])
  updateJSONFile('json/tokens/mito/testnet.json', [{ denom: unknown }])
  generate()
  assert.deepEqual(read('json/tokens/bff/testnet.json'), [])
  assert.deepEqual(read('json/tokens/mito/testnet.json'), [])
  for (const kind of ['bff', 'mito']) {
    const path = `json/tokens/${kind}/testnet.json`
    for (const invalid of ['{', '{}', 'null', '[null]', '[{}]']) {
      writeFileSync(join(root, path), invalid)
      assert.throws(() => pruneTokenSnapshots(Network.TestnetSentry, read('json/tokens/testnet.json')))
      assert.equal(bytes(path), invalid)
    }
    updateJSONFile(path, [])
  }
  // Even direct/manual discovery calls must not recreate deleted files.
  const { fetchBFFTokens } = await import('./fetch/bffTokens')
  const { fetchMitoVaults } = await import('./fetch/mitoVaults')
  const { generateMitoTokens } = await import('./generate/mitoTokens')
  const { generateSupplyToken } = await import('./generate/tokens/supplyTokens')
  const { generateCw20FactoryTokens, generateBankFactoryTokens } = await import('./generate/tokens/factoryTokens')
  const { fetchPeggyTokenMetaData } = await import('./helper/fetchPeggyTokens')
  const { fetchCw20Token, fetchCw20FactoryToken } = await import('./helper/fetchCw20Metadata')
  const { fetchIbcTokenMetaData } = await import('./helper/fetchIbcDenomTrace')
  Object.getPrototypeOf(new Alchemy().core).getTokenMetadata = async () => {
    forbiddenQueries.push('Alchemy discovery')
    return {}
  }
  ChainGrpcWasmApi.prototype.fetchContractInfo = async () => {
    forbiddenQueries.push('CW20 contract discovery')
    throw new Error('forbidden')
  }
  ChainGrpcWasmApi.prototype.fetchContractState = async () => {
    forbiddenQueries.push('CW20 state discovery')
    throw new Error('forbidden')
  }
  ChainGrpcIbcApi.prototype.fetchDenomTrace = async () => {
    forbiddenQueries.push('IBC trace discovery')
    throw new Error('forbidden')
  }
  for (const network of networks) {
    await Promise.all([fetchBFFTokens(network), fetchMitoVaults(network), fetchInsuranceFunds(network), generateMitoTokens(network), generateSupplyToken(network), generateCw20FactoryTokens(network), generateBankFactoryTokens(network)])
    assert.equal(await fetchPeggyTokenMetaData('peggy0x0000000000000000000000000000000000000001', network), undefined)
    assert.equal(await fetchCw20Token(cw20, network), undefined)
    assert.equal(await fetchCw20FactoryToken(cw20, network), undefined)
    assert.equal(await fetchIbcTokenMetaData('ibc/test-hash', network), undefined)
  }
  const peggy = Object.values(read('src/generated/tokens/peggyTokens/mainnet.json'))[0] as Token
  assert.equal((await fetchPeggyTokenMetaData(peggy.denom, Network.MainnetSentry))?.denom, peggy.denom)
  const traceHash = Object.keys(read('src/cache/ibcDenomTrace/mainnet.json'))[0]
  assert.equal((await fetchIbcTokenMetaData(`ibc/${traceHash}`, Network.MainnetSentry))?.denom, `ibc/${traceHash}`)
  const cw20Address = Object.keys(read('src/cache/cw20ContractSources/mainnet.json'))[0]
  assert.equal((await fetchCw20Token(cw20Address, Network.MainnetSentry))?.address, cw20Address)
  for (const n of names) {
    for (const kind of ['cw20ContractSources', 'ibcDenomTrace', 'insuranceFunds', 'mito']) assert(!existsSync(join(root, `src/cache/${kind}/${n}.json`)))
    for (const kind of ['bankSupplyTokens', 'cw20Tokens', 'factoryTokens', 'mito', 'peggyTokens']) assert(!existsSync(join(root, `src/generated/tokens/${kind}/${n}.json`)))
  }
  assert.deepEqual(forbiddenQueries, [])
  assert.deepEqual(mainnetPaths.map(bytes), mainnetBefore)
  const scripts = read('src/package.json').scripts
  const [flush, generateTokens] = scripts['generate:tokens:flush'].split(' && ')
  const [runner, script] = flush.split(' ')
  execFileSync(process.execPath, ['--import', runner, script], { cwd: join(root, 'src'), stdio: 'pipe' })
  assert.deepEqual(read('src/cache/cw20ContractSources/mainnet.json'), {})
  assert(!existsSync(join(root, 'data/cw20ContractSources')))
  assert(scripts[generateTokens.replace('pnpm ', '')].includes('generate:tokens:list'))
  console.log('Curated token checks passed: bounded lookups, outage fallback, schemas, markets, mainnet and repeatability.')
}

