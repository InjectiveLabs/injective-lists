## Scripts:

Below we break down the different steps/scripts we have on [injective-list](https://github.com/InjectiveLabs/injective-lists/tree/master/src/ts-scripts), explaining the step by step process generating the final list of TokenStatic data for use across the FE products.

### Maintaining testnet and devnet tokens

Testnet and devnet publish only the manually maintained sources in [data/tokens](./data/tokens): `evm.ts`, `ibc.ts`, `cw20.ts`, `erc20.ts`, and `tokenFactory.ts`, plus native INJ and `untaggedSymbolMeta.ts` symbol entries. [staticTokenSources.ts](./ts-scripts/helper/staticTokenSources.ts) shares source selection between generation and metadata lookups. Both networks inherit mainnet IBC, Peggy, CW20, and factory entries; they also share each other's Peggy, CW20, and factory entries. EVM entries stay specific to each network.

Add or update entries using [CONTRIBUTING.md](../CONTRIBUTING.md). Set factory `subdenom` explicitly when it differs from the lowercased symbol, and preserve the token's exact decimals, including 0. Manual inclusion does not change verification rules: factory denoms still require the separate `verifiedTokenFactoryDenoms` list to be verified.

Non-mainnet generation does not discover factory, supply, insurance, CW20, or Mito tokens. Bank metadata and supply casing are refreshed only by known denom; CW20 adapter responses are filtered to curated contract addresses. EVM pairs are queried by curated denom and cached in `cache/evmTokenPairs`. Each refresh replaces these caches with approved subsets. Failed lookups retain approved cached mappings; missing optional metadata uses the static entry.

Denoms are case-sensitive. Refreshes preserve the existing first-match casing and accept only exact denom matches from bank and EVM lookups, including cached fallback data.

The existing `json/tokens/bff/` and `json/tokens/mito/` non-mainnet files are manually maintained snapshots. Every final-list generation prunes records outside the curated list while preserving each remaining record's schema, including writing `[]` when empty. Adding a static token does not add a snapshot record. The absent devnet BFF snapshot stays absent. BFF and Mito fetch commands fetch mainnet only.

Existing snapshots must be valid JSON arrays of records with string denoms. Invalid files stop generation; only absent files are skipped.

Run `pnpm generate:tokens` for the token pipeline and `pnpm generate:verifiedDenoms` for Helix denoms. For an offline rebuild from existing mappings, run `pnpm generate:tokens:static`, `pnpm generate:tokens:list`, `pnpm generate:tokens:verified`, and `pnpm generate:verifiedDenoms` in that order. Run `pnpm check:curated:tokens` for isolated, mocked regression checks and `pnpm exec tsc --noEmit --skipLibCheck` for project type checking.

`pnpm generate:tokens:flush` clears the mainnet CW20 contract metadata cache before running the token pipeline again.

Token URLs, schemas, and legacy `tokens/` copies remain unchanged. Mainnet discovery and the shared 15-minute workflow continue, including market, validator, WASM, configuration, restriction, and swap jobs. Existing S3 upload and CloudFront invalidation workflows publish the JSON outputs.

### Fetch chain metadata

https://github.com/InjectiveLabs/injective-lists/blob/master/ts-scripts/fetchChainTokenMetadata.ts

On mainnet, the script will fetch:

1. bankMetadata from https://sentry.lcd.injective.network/swagger/#/Query/DenomsMetadata and cache them as [json files](./cache/bankMetadata/) which we will use as a source of reference for tokenFactory denoms.
2. insuranceTokens from https://sentry.lcd.injective.network/swagger/#/Query/InsuranceFunds and cache them as [json files](./cache/insuranceFunds/) which we will use as a source of reference for insurance denoms.
3. supplyDenoms from https://sentry.lcd.injective.network/swagger/#/Query/TotalSupply and cache the denoms as [json files](./cache/bankSupplyDenoms/), they will be used in the `Format supply tokens` script below.

### Generate static tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/staticTokens.ts

The script will import the hardcoded data from [these files](./data/tokens/) and convert them to TokenStatic tokens based on their type.
Note: These hardcoded data/denoms here will take priority over data retrieved via other sources.

ℹ️ Refer to this [doc](./../CONTRIBUTING.md) on adding new static token-metadata to the injective-list repo.

### Upload images to CloudFlare

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/upload/tokenImages.ts
https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/upload/validatorImages.ts

Since images are no longer stored on the repo, we now use cloudflare to host the token logos/images.

The script will scan the [images](./images/) folder and compare it against the [tokenImagePath.json](./data/tokenImagePaths.json) map, if the image name doesn’t exist on the json file, the script will upload the image to cloudflare and create a new entry on the tokenImagePath.json file.

### Format supply tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/supplyToken.ts

On mainnet only, the script will import the cached [supply denoms](./cache/bankSupplyDenoms/) fetched in the `Fetch chain metadata` script and:

- filter out denoms that are hardcoded in the [staticTokens json file](./data/)
- format the denoms to tokenStatic based on the denom
  - retrieve insurance tokens data from the [insuranceFunds](./../data/insuranceFunds/) json files
  - retrieve tokenFactory token data from the [bankMetadata](./../tokens/bankSupplyTokens/) json files
  - retrieve cw20 tokenFactory token data from the cw20 [cw20ContractSources](./../data/cw20ContractSources/) json files or query against the chain via the [fetchCw20FactoryToken]('./ts-scripts/helper/fetchCw20Metadata.ts') helper function
  - retrieve ibc token data via the chain https://lcd.injective.network/swagger/#/Query/DenomTrace endpoint
  - retrieve peggy token from alchemy via the [fetchPeggyTokenMetaData](./ts-scripts/helper/fetchPeggyTokens.ts) helper function
- note that, there will be no cw20 tokens from the bankSupplyDenoms

### Format cached external tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/externalTokens.ts

On mainnet only, the script reads the retained [external token source cache](./cache/externalTokensSource.json), originally populated from TFM. The retired endpoint is no longer contacted. The cached inventory and generated token contributions remain in use to preserve existing mainnet metadata.

The script will:

- filter out denoms that are hardcoded in the [staticTokens json file](https://github.com/InjectiveLabs/injective-lists/tree/master/tokens/staticTokens)
- format the cached source data to tokenStatic, retaining existing chain metadata lookups:
  - retrieve tokenFactory token data from the [bankMetadata](./../tokens/bankSupplyTokens/) json files
  - retrieve cw20 token data from the cw20 [cw20ContractSources](./../data.cw20ContractSources/) json files or query against the chain via the [fetchCw20Token]('./src/ts-scripts/helper/fetchCw20Metadata.ts') helper function
  - retrieve cw20 tokenFactory data from the [bankMetadata](./../data/cw20ContractSources/) json files
  - retrieve ibc token data via the chain https://lcd.injective.network/swagger/#/Query/DenomTrace endpoint
  - retrieve peggy token from alchemy via the [fetchPeggyTokenMetaData](./ts-scripts/helper/fetchPeggyTokens.ts) helper function
- note that there are no insurance tokens in the cached external source

### Collate the tokens from different sources into one list

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens.ts

The script will:

1. Use static tokens only on testnet/devnet. On mainnet combine the tokens from the:
   - static tokens
   - supply tokens
   - external tokens [mainnet only]
2. Sort the list based on TokenVerification in the following order:
   - Verified
   - Internal
   - External
   - UnVerified
3. Sort the list by denom alphabetically based on denom
4. append the correct cloudFlare logo based on the token's string logo via the [tokenImagePaths](./data/tokenImagePaths.json) json file.
5. generate one json file for each environment (mainnet, testnet and devnet), this will be the only reference file required for production usage
   - [devnet.json](./../json/tokens/devnet.json)
   - [testnet.json](./../json/tokens/testnet.json)
   - [mainnet.json](./../json/tokens/mainnet.json)
