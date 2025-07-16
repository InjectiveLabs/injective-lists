# 📜 Adding a new Static token

StaticTokens is an off-chain list of manually maintained token metadata (symbol, name, decimals, logo for the particular denom, etc).
These static tokens are generated via data from a few different files in the [data folder](./ts-scripts/data/).

Follow the steps below to add/update token-metadata on the injective-list repo.

## Step 1: Create SymbolMeta entry

The [symbolMeta.ts](./src/data/tokens/symbolMeta.ts) file contains the symbolMeta details unique to each symbol with the following interface:

```ts
export interface TokenSymbolMeta {
  name: string;
  logo: string;
  symbol: string;
  decimals: number;
  coinGeckoId: string;
}
```

### Adding a symbol meta entry

Add the symbolMeta entry to the bottom of the [list](./src/data/tokens/symbolMeta.ts) - only if it **doesn't exist** on the list:

```ts
export const symbolMeta: Record<string, TokenSymbolMeta> = {
  ...,
  EXAMPLE: {
    decimals: 18,
    name: 'example',
    logo: 'imageFileName.png',
    symbol: 'EXAMPLE',
    coinGeckoId: 'example-coinGeckoId',
  }
}
```

## Step 2: Upload the token image/logo

In the CI/CD workflow, the [uploadImages](./ts-scripts/upload/tokenImages.ts) script will automatically upload images in the [images folder](./ts-scripts/images/tokens) that doesn't already exist on the [tokenImagePaths.json file](./data/tokenImagePaths.json) to cloudflare.

Follow the steps below to add a new image:

### Upload new token logo

1. Copy the token image to the [images folder](./ts-scripts/images/tokens)
2. Make sure the image fileName is unique in the folder - image fileName is used as the unique identifier mapping cloudflare URL to the token image.

#### Update existing token logo

1. Copy and override the token image with file you want to replace in the [images folder](./ts-scripts/images/tokens)
2. Delete the object key-pair that has the same imageFileName, this ensures that the [uploadImages](./ts-scripts/upload/tokenImages.ts) script uploads the new logo to cloudflare.

**The image name should match the symbolMeta entry logo field for example `imageFileName.png`.**
**Note that: we only support the following formats `['png', 'jpg', 'jpeg', 'svg', 'webp']`.**

## Step3: Add token metadata

There are a few different token types, namely Cw20, TokenFactory, Erc20 (Peggy) and IBC.
Using `EXAMPLE` symbol meta above, here are how to add token metadata for the different token types:

### ERC20 (peggy)

In the [erc20.ts file](./src/data/tokens/erc20.ts) file, add an entry to the end of `mainnetTokens` array:

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    address: "0x...",
  },
];
```

We can also override SymbolMeta data here

```ts
export const mainnetTokens = [
  {
    // we can also override SymbolMeta data here
    ...symbolMeta.EXAMPLE,
    decimals: 6,
    coinGeckoId: "example-coinGeckoId-override",
    name: "example-override",
    logo: "imageFileName-override.png",
    symbol: "symbol-override",
    address: "0x...",
  },
];
```

#### IBC Tokens

In the [ibc.ts file](./src/data/tokens/ibc.ts) file, add an entry to the end of `mainnetTokens` array:

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    channelId: "channel-example",
    source: TokenSource.Cosmos,
    path: "transfer/channel-example",
    hash: "...",
    baseDenom: "uexample",
  },
];
```

We can also override SymbolMeta data here

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    channelId: "channel-example",
    source: TokenSource.Cosmos,
    path: "transfer/channel-example",
    hash: "...",
    baseDenom: "uexample",
    decimals: 6,
    coinGeckoId: "example-coinGeckoId-override",
    name: "example-override",
    logo: "imageFileName-override.png",
    symbol: "symbol-override",
  },
];
```

#### Cw20 Tokens

In the [cw20.ts file](./src/data/tokens/cw20.ts) file, add an entry to the end of `mainnetTokens` array:

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    address: "inj...",
  },
];
```

We can also override SymbolMeta data here

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    decimals: 6,
    coinGeckoId: "example-coinGeckoId-override",
    name: "example-override",
    logo: "imageFileName-override.png",
    symbol: "symbol-override",
    address: "inj...",
  },
];
```

### Token factory tokens

In the [tokenFactory.ts file](./src/data/tokens/tokenFactory.ts) file, add an entry to the end of `mainnetTokens` array:

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    creator: "inj...",
  },
];
```

We can also override SymbolMeta data here

```ts
export const mainnetTokens = [
  {
    ...symbolMeta.EXAMPLE,
    creator: "inj...",
    decimals: 6,
    coinGeckoId: "example-coinGeckoId-override",
    name: "example-override",
    logo: "imageFileName-override.png",
    symbol: "symbol-override",
  },
];
```

### Verifying token factory denoms

To verify factory tokens, add their denoms to the verifiedTokenFactoryDenoms array in ./src/data/tokens/denoms.ts. This is a manually curated list of approved denoms.
