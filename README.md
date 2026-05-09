```
 ┌─────────────────────────────────────────────────────────────┐
 │                                                             │
 │   O P E N Z E P P E L I N    E X P L O R A T I O N          │
 │                                                             │
 │   Audited Solidity components, applied in practice.         │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
```

[![CI](https://github.com/DRT23-mod/openzeppelin-exploration/actions/workflows/ci.yml/badge.svg)](https://github.com/DRT23-mod/openzeppelin-exploration/actions)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://docs.soliditylang.org/en/v0.8.24/)
[![OZ](https://img.shields.io/badge/OpenZeppelin-5.x-2c3e50.svg)](https://docs.openzeppelin.com/contracts/5.x/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

The de facto standard library of audited Solidity components. This repo applies the
v5 contracts to three real-world patterns and exercises them with a full Hardhat
test suite.

---

## Table of Contents

- [Why this repo](#why-this-repo)
- [What is covered](#what-is-covered)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Contracts at a glance](#contracts-at-a-glance)
- [Inheritance diagrams](#inheritance-diagrams)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Notes from the build](#notes-from-the-build)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Why this repo

`Ownable` is a fine starting point for a tutorial. Real systems need finer-grained
control, pausable circuit breakers, role rotation, and audited primitives that
auditors recognise on sight. This repo wires those building blocks into three
small contracts so the patterns are visible end-to-end.

## What is covered

| Pattern              | Contract            | OZ primitive(s) used                         |
|----------------------|---------------------|----------------------------------------------|
| Role-gated ERC-20    | `MyToken.sol`       | `ERC20`, `ERC20Burnable`, `ERC20Pausable`, `AccessControl` |
| Owner-minted ERC-721 | `MyNFT.sol`         | `ERC721URIStorage`, `Ownable`                |
| Multi-role treasury  | `VaultWithRoles.sol`| `AccessControl` (no `Ownable` at all)        |

## Prerequisites

| Tool       | Version  | Notes                                           |
|------------|----------|-------------------------------------------------|
| Node.js    | >= 18.x  | 20.x LTS recommended for Hardhat compatibility |
| npm        | >= 9.x   | Comes with Node.js                              |
| Git        | any      | For cloning                                     |

> Solidity 0.8.24 with the **Cancun** EVM version is required because OZ v5.1+
> uses the `mcopy` opcode in `Bytes.sol`. The hardhat config sets this for you.

## Quick start

```bash
git clone https://github.com/DRT23-mod/openzeppelin-exploration.git
cd openzeppelin-exploration
npm install
npx hardhat compile
npx hardhat test
```

Expected output:

```
  MyNFT
    ✔ mints a token with the correct URI
    ✔ increments token IDs sequentially
    ✔ reverts mint from non-owner
    ✔ supports ERC-165 interface detection
  MyToken
    ✔ grants MINTER_ROLE to minter address
    ✔ allows minter to mint tokens
    ✔ reverts when non-minter tries to mint
    ✔ allows pauser to pause and unpause
  VaultWithRoles
    ✔ depositor can deposit ETH
    ✔ reverts deposit from non-depositor
    ✔ withdrawer can withdraw ETH
    ✔ reverts withdrawal from non-withdrawer
    ✔ reverts withdrawal when balance is insufficient
    ✔ admin can revoke roles

  14 passing
```

## Project structure

```
openzeppelin-exploration/
├── contracts/
│   ├── token/
│   │   ├── MyToken.sol           # ERC-20 + Burnable + Pausable + AccessControl
│   │   └── MyNFT.sol             # ERC-721 + URIStorage + Ownable
│   └── access/
│       └── VaultWithRoles.sol    # Multi-role ETH vault, no Ownable
├── scripts/
│   └── deploy.js                 # Deploys all three contracts
├── test/
│   ├── MyToken.test.js
│   ├── MyNFT.test.js
│   └── VaultWithRoles.test.js
├── .github/workflows/ci.yml      # Compile + test + coverage on PR
├── hardhat.config.js             # 0.8.24 / cancun / optimizer 200
├── package.json
└── README.md
```

## Contracts at a glance

### `MyToken` (ERC-20)

A pausable, burnable ERC-20 with role-separated minting and pausing. The
`MINTER_ROLE` is held by a hot wallet that can mint into circulation; the
`PAUSER_ROLE` and `DEFAULT_ADMIN_ROLE` are held by a cold address (or multisig).

```solidity
constructor(address defaultAdmin, address minter)
    ERC20("MyToken", "MTK")
{
    _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    _grantRole(MINTER_ROLE,        minter);
    _grantRole(PAUSER_ROLE,        defaultAdmin);
}
```

The override of `_update` chains both `ERC20` and `ERC20Pausable` so that burn,
transfer, and mint all respect the paused state.

### `MyNFT` (ERC-721)

Minimal collection contract with sequential token IDs and per-token URIs. Mint
is gated by `Ownable` because there is only one privileged actor.

### `VaultWithRoles`

Demonstrates `AccessControl` without `Ownable`. Two roles, `DEPOSITOR_ROLE` and
`WITHDRAWER_ROLE`, can be granted independently. Useful when you want a payment
processor that can deposit but never withdraw, and a treasurer that can withdraw
but does not need to be the same key as the deposit ingest.

## Inheritance diagrams

```
MyToken
  ├── ERC20            (core balances, transfers, allowances)
  ├── ERC20Burnable    (adds burn / burnFrom)
  ├── ERC20Pausable    (whenNotPaused on _update)
  └── AccessControl    (DEFAULT_ADMIN_ROLE + named roles)

MyNFT
  ├── ERC721
  ├── ERC721URIStorage (per-token tokenURI overrides)
  └── Ownable          (single-owner mint gate)

VaultWithRoles
  └── AccessControl    (DEFAULT_ADMIN_ROLE controls grant/revoke)
```

## Scripts

| Command                                        | What it does                                |
|------------------------------------------------|---------------------------------------------|
| `npx hardhat compile`                          | Compile all contracts to artifacts          |
| `npx hardhat test`                             | Run the full test suite                     |
| `npx hardhat coverage`                         | Solidity test coverage report               |
| `npx hardhat run scripts/deploy.js`            | Deploy locally to the Hardhat network       |
| `npx hardhat run scripts/deploy.js --network sepolia` | Deploy to Sepolia (needs `.env`)     |
| `REPORT_GAS=true npx hardhat test`             | Test run with the gas usage table           |

## Testing

The suite covers happy paths, role-revert paths, event emission, and ERC-165
interface detection. Tests use Hardhat fixtures via `loadFixture` for fast resets.

```javascript
// Example: revert when a non-minter tries to mint
await expect(
  token.connect(user).mint(user.address, ethers.parseEther("100"))
).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
```

OZ v5 uses **custom errors** instead of `require` strings. Tests use
`revertedWithCustomError` to assert these. Common ones:

- `AccessControlUnauthorizedAccount(address, bytes32)`
- `OwnableUnauthorizedAccount(address)`
- `EnforcedPause()`
- `ERC20InsufficientBalance(address, uint256, uint256)`

## Deployment

Set a Sepolia RPC and a private key in `.env`:

```bash
cp .env.example .env
# edit .env:
#   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<key>
#   PRIVATE_KEY=0x<key>
```

Deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The script prints each deployed address. Add the addresses below the table once
you deploy:

| Contract        | Sepolia address |
|-----------------|-----------------|
| MyToken         | _not deployed_  |
| MyNFT           | _not deployed_  |
| VaultWithRoles  | _not deployed_  |

## Configuration

| Env var            | Required          | Purpose                          |
|--------------------|-------------------|----------------------------------|
| `SEPOLIA_RPC_URL`  | for Sepolia deploy| RPC endpoint for the test net    |
| `PRIVATE_KEY`      | for any deploy    | Deployer account                 |
| `ETHERSCAN_API_KEY`| for verification  | Used by `hardhat verify`         |

## Notes from the build

- OZ 5.1 requires Solidity 0.8.24+ and `evmVersion: "cancun"`. With anything
  older you will hit `Function "mcopy" not found` from `Bytes.sol`.
- `ERC20Pausable` hooks via `_update`, not `_beforeTokenTransfer` (that hook was
  removed in v5). Forgetting the override compiles but breaks pause semantics.
- Mint counts towards `_update`, so **mint while paused reverts**. Production
  systems usually mint into a vesting contract before pausing trades.
- Prefer `AccessControl` over `Ownable` whenever there is more than one
  privileged actor. `renounceOwnership` is a foot-gun that has bricked real
  protocols.

## Troubleshooting

**`HH606: Solidity version pragma doesn't match`**
Bump `solidity.version` in `hardhat.config.js` to `0.8.24` or later.

**`Function "mcopy" not found`**
Add `settings.evmVersion: "cancun"` to your hardhat compiler config.

**Tests fail with `EnforcedPause` after pausing**
You cannot mint into a paused contract. Mint first, then pause.

## References

- [OpenZeppelin Contracts v5 docs](https://docs.openzeppelin.com/contracts/5.x/)
- [OZ Wizard (scaffold a contract)](https://wizard.openzeppelin.com)
- [Solidity 0.8.24 release notes](https://soliditylang.org/blog/2024/01/26/solidity-0.8.24-release-announcement/)
- [Hardhat docs](https://hardhat.org/docs)

## License

MIT
