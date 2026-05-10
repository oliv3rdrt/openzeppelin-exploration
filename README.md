# openzeppelin-exploration

Three real-world Solidity patterns built on OpenZeppelin Contracts v5, each with a full Hardhat test suite. The contracts are intentionally small so the patterns are visible end-to-end rather than buried in business logic.

## Stack

- Solidity 0.8.24
- OpenZeppelin Contracts 5.x
- Hardhat + ethers v6 + Chai

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 9+ |

## Quick start

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Patterns covered

| Pattern | Contract | OZ primitives |
|---|---|---|
| Role-gated ERC-20 with burn and pause | `contracts/MyToken.sol` | `ERC20`, `ERC20Burnable`, `ERC20Pausable`, `AccessControl` |
| Owner-minted ERC-721 with metadata | `contracts/MyNFT.sol` | `ERC721URIStorage`, `Ownable` |
| Multi-role treasury, no Ownable | `contracts/VaultWithRoles.sol` | `AccessControl` |

## Why these specifically

`Ownable` is fine for a tutorial. Real systems need finer-grained control, pausable circuit breakers, role rotation, and audited primitives that auditors recognize on sight. Each contract here demonstrates a different layer of that: ERC standards layered with `AccessControl`, lifecycle hooks (pause/unpause), and pure role-based authorization without a single owner.

## What's in here

- `contracts/`: the three pattern contracts
- `test/`: Hardhat tests, one file per contract, exercising every role transition and revert path
- `scripts/deploy.ts`: deploy script with role granting
- `hardhat.config.ts`: networks, gas reporter
