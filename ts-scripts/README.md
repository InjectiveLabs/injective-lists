## Token metadata:

Assets on Injective are represented as denoms. Denoms (and the amounts) are not human readable and this is why we need to have a way to "attach" token metadata information for a particular denom.

---

### 🪙 Token/Denom types:

This [page](./TOKEN.md) covers a quick overview on the different type of denoms/tokens supported across the injective ecosystem.

---

### 🛠️ Build process

This [page](./SCRIPTS.md) covers a quick overview on the different ts-script scripts and how they retrieve and format data from different source into the generic TokenStatic type that is used across Injective's FE product suite.

---

### 📜 Contribution

A step by step guide can be found here on [Adding a new static token](./ts-scripts//ADD_TOKEN.md) page. Please make sure you read them before you open a PR.

---

### 🔮 Usage

Fetch the tokens json file from github to integrate it on your product:

- Devnet: https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/tokens/devnet.json
- Testnet: https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/tokens/testnet.json
- Mainnet: https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/tokens/mainnet.json
