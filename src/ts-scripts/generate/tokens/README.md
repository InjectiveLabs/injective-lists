## Token definitions:

Below are definition and breakdown on different token types supported on the injective-list repo.

### IBC token

These are tokens with denoms bridged over other Cosmos chains via IBC.
It’s denom has the following format `ibc/hash`, and it has fields applicable only to them such as `path`, `channelId`, `baseDenom`, `hash` and `source`.

Created with the following characteristics:

```ts
{
  source?: TokenSource
  path?: string
  channelId?: string
  baseDenom?: string

  /**
    denom without the ibc/ prefix
    {
      denom: 'ibc/012d069d557c4dd59a670aa17e809cb7a790d778e364d0bc0a3248105da6432d'
      hash: '012d069d557c4dd59a670aa17e809cb7a790d778e364d0bc0a3248105da6432d'
    }
  **/
  hash?: string

  /*
    "path": "transfer/channel-1/transfer/channel-141/transfer/channel-122",
    here we can see that this token was transfered from channel-1 > channel-141 > channel-122
  */
  path?: string // represents the historical on-chain trace of this denom between different chains

  /*
    combining the 'path' prefix with the baseDenom will give us the hash, for eg.
    sha256Hash('path' + baseDenom) => hash
  */
  baseDenom?: string // human-readable denom representation of the token
  source?: TokenSource // additional information apart from the on-chain data, added/hardcoded for UI/UX purposes
  tokenType: TokenType.Ibc20,
  tokenVerification:
      TokenVerification.Verified || TokenVerification.Unverified

}
```

ℹ️ `denomTrace` can be retrieved from the chain via this endpoint using ibcHash:
https://sentry.lcd.injective.network/swagger/#/Query/DenomTrace

### Insurance token

These are tokens representing tokens shares of the insurance funds created on Injective. It’s denom has the following format `share{id}`

Created with the following characteristics:

```ts
{
   tokenType: TokenType.InsuranceToken,
   tokenVerification:
	   TokenVerification.Verified
}
```

InsuranceTokens on the frontend are overwritten with the following information:

```ts
{
  "logo": "injective-logo",
  "decimals": 18,
  "tokenType": TokenType.InsuranceFund,
  "tokenVerification": TokenVerification.Verified
}
```

- There can be multiple insuranceTokens tagged with the same marketId, note that there can only be one active insurance token for each market at any given time.
- There can be insurance denom on the chain that doesn’t have an record against the insurance funds endpoint, these are invalid insurance tokens that we can ignore. For example:
  - https://explorer.injective.network/asset/?tokenType=insuranceFund&denom=share46

ℹ️ InsuranceToken can be retrieved from the chain via market using this endpoint:
https://sentry.lcd.injective.network/swagger/#/Query/InsuranceFund
ℹ️ InsuranceTokens can be retrieved from the chain via this endpoint:
https://sentry.lcd.injective.network/swagger/#/Query/InsuranceFunds

### Factory token

These are tokens converted from a cw20 token or natively created via the [tokenFactoryModule](https://docs.injective.network/develop/guides/token-launch/#3-create-a-tokenfactory-denom), it’s denom has the following format:

- cw20 converted tokens: `factor/{ADAPTER_CONTRACT_ADDRESS}/{CW20_CONTRACT_ADDRESS}`
  - e.g. `factory/inj1vcqkkvqs7prqu70dpddfj7kqeqfdz5gg662qs3/lpinj12hrath9g2c02e87vjadnlqnmurxtr8md7djyxm`
- natively created tokens: `factory/{OWNER_ADDRESS}/{SUD_DENOM}`
  - e.g. `factory/inj104h3hchl7ws8lp78zpvrunvsjdwfjc02r5d0fp/injx`

ℹ️ TokenFactory metadata can be retrieved from the chain via this endpoint:
https://sentry.lcd.injective.network/swagger/#/Query/DenomsMetadata

Created with the following characteristics:

```ts
{
   tokenType: TokenType.TokenFactory,
   tokenVerification:
	   TokenVerification.Verified
	   || TokenVerification.Unverified
     || TokenVerification.Blacklisted
}
```

### Cw20 token

These are cw20 wasm smart contract tokens, it’s denom has the following format `inj…`

Created with the following characteristics:

```ts
{
   tokenType: TokenType.Cw20,
   tokenVerification:
	   TokenVerification.Verified
	   || TokenVerification.Unverified
}
```

ℹ️ User’s cw20 balances can be retrieved via this indexer endpoint:
https://sentry.explorer.grpc-web.injective.network/api/explorer/v1/wasm/inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z/cw20-balance

ℹ️ Cw20 token metadata can be retrieved using this 2 endpoints:

1. fetchContractInfo
   https://sentry.lcd.injective.network/swagger/#/Query/ContractInfo
2. fetchContractState
   https://sentry.lcd.injective.network/swagger/#/Query/AllContractState

### Peggy token

These are tokens bridged over from the Ethereum network via the Peggy bridge, it’s denom has the following format `peggy{ERC20_CONTRACT_ADDRESS}`

Created with the following characteristics:

```ts
{
   tokenType: TokenType.Erc20,
   tokenVerification:
	   TokenVerification.Verified  // metadata was hardcoded
	   || TokenVerification.Unverified // metadata was fetched via alchemy
}
```

ℹ️ Peggy tokens metadata can be retrieved via alchemy’s SDK [getTokenMetadata function](https://docs.alchemy.com/docs/how-to-get-token-metadata#raw-api-response) using the `ERC20_CONTRACT_ADDRESS`
