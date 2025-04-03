## Scripts:

Below we break down the different steps/scripts we have on [injective-list](https://github.com/InjectiveLabs/injective-lists/tree/master/src/ts-scripts), explaining the step by step process generating the final list of TokenStatic data for use across the FE products.

### Fetch chain metadata

https://github.com/InjectiveLabs/injective-lists/blob/master/ts-scripts/fetchChainTokenMetadata.ts

The script will fetch:

1. bankMetadata from https://sentry.lcd.injective.network/swagger/#/Query/DenomsMetadata and cache them as [json files](./cache/bankMetadata/) which we will use as a source of reference for tokenFactory denoms.
2. insuranceTokens from https://sentry.lcd.injective.network/swagger/#/Query/InsuranceFunds and cache them as [json files](./cache/insuranceFunds/) which we will use as a source of reference for insurance denoms.
3. supplyDenoms from https://sentry.lcd.injective.network/swagger/#/Query/TotalSupply and cache the denoms as [json files](./cache/bankSupplyDenoms/), they will be used in the `Format supply tokens` script below.

### Generate static tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/staticTokens.ts

The script will import the hardcoded data from [these files](./cache/) and convert them to TokenStatic tokens based on their type.
Note: These hardcoded data/denoms here will take priority over data retrieved via other sources.

ℹ️ Refer to this [doc](./../CONTRIBUTING.md) on adding new static token-metadata to the injective-list repo.

### Upload images to CloudFlare

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/upload/tokenImages.ts
https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/upload/validatorImages.ts

Since images are no longer stored on the repo, we now use cloudflare to host the token logos/images.

The script will scan the [images](./images/) folder and compare it against the [tokenImagePath.json](./data/tokenImagePaths.json) map, if the image name doesn’t exist on the json file, the script will upload the image to cloudflare and create a new entry on the tokenImagePath.json file.

### Format supply tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/supplyToken.ts

The script will import the cached [supply denoms](./cache/bankSupplyDenoms/) fetched in the `Fetch chain metadata` script and:

- filter out denoms that are hardcoded in the [staticTokens json file](./data/)
- format the denoms to tokenStatic based on the denom
  - retrieve insurance tokens data from the [insuranceFunds](./../data/insuranceFunds/) json files
  - retrieve tokenFactory token data from the [bankMetadata](./../tokens/bankSupplyTokens/) json files
  - retrieve cw20 tokenFactory token data from the cw20 [cw20ContractSources](./../data/cw20ContractSources/) json files or query against the chain via the [fetchCw20FactoryToken]('./ts-scripts/helper/fetchCw20Metadata.ts') helper function
  - retrieve ibc token data via the chain https://lcd.injective.network/swagger/#/Query/DenomTrace endpoint
  - retrieve peggy token from alchemy via the [fetchPeggyTokenMetaData](./ts-scripts/helper/fetchPeggyTokens.ts) helper function
- note that, there will be no cw20 tokens from the bankSupplyDenoms

### Fetch & format external tokens

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens/externalTokens.ts

The script will fetch data from https://api.tfm.com/api/v1/ibc/chain/injective-1/tokens [TFM aggregator](https://tfm.com/) endpoint and:

- filter out denoms that are hardcoded in the [staticTokens json file](https://github.com/InjectiveLabs/injective-lists/tree/master/tokens/staticTokens)
- format the response data to tokenStatic:
  - retrieve tokenFactory token data from the [bankMetadata](./../tokens/bankSupplyTokens/) json files
  - retrieve cw20 token data from the cw20 [cw20ContractSources](./../data.cw20ContractSources/) json files or query against the chain via the [fetchCw20Token]('./src/ts-scripts/helper/fetchCw20Metadata.ts') helper function
  - retrieve cw20 tokenFactory data from the [bankMetadata](./../data/cw20ContractSources/) json files
  - retrieve ibc token data via the chain https://lcd.injective.network/swagger/#/Query/DenomTrace endpoint
  - retrieve peggy token from alchemy via the [fetchPeggyTokenMetaData](./ts-scripts/helper/fetchPeggyTokens.ts) helper function
- note that, there will be no insurance tokens from the tfm api response

### Collate the tokens from different sources into one list

https://github.com/InjectiveLabs/injective-lists/blob/master/src/ts-scripts/generate/tokens.ts

The script will:

1. combine the tokens from the:
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
