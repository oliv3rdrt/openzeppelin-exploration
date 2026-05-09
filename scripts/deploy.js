const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy MyToken
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(deployer.address, deployer.address);
  await token.waitForDeployment();
  console.log("MyToken deployed to:", await token.getAddress());

  // Deploy MyNFT
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy(deployer.address);
  await nft.waitForDeployment();
  console.log("MyNFT deployed to:", await nft.getAddress());

  // Deploy VaultWithRoles
  const VaultWithRoles = await ethers.getContractFactory("VaultWithRoles");
  const vault = await VaultWithRoles.deploy(deployer.address);
  await vault.waitForDeployment();
  console.log("VaultWithRoles deployed to:", await vault.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
