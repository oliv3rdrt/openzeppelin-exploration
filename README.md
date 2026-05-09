# OpenZeppelin Contracts - Personal Exploration

Testing out the [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) library - the audited Solidity component library used across nearly every serious EVM project.

## What I explored

- **ERC-20** - deployed a custom token with mint/burn and role-based access
- **ERC-721** - built a simple NFT collection with OpenZeppelin's ERC721URIStorage
- **AccessControl** - replaced `Ownable` with granular role-based permissions
- **Upgradeable proxies** - tested the UUPS proxy pattern using OpenZeppelin Upgrades

## Setup

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Key takeaways

- The Wizard at https://wizard.openzeppelin.com is the fastest way to scaffold a contract
- `AccessControl` is almost always preferable to `Ownable` for anything multi-role
- The `_authorizeUpgrade` pattern in UUPS is clean but easy to forget the `onlyOwner` guard
- Inherited contracts like `ERC20Burnable`, `ERC20Pausable` compose cleanly via multiple inheritance
