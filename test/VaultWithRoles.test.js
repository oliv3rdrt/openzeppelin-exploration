const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VaultWithRoles", function () {
  let vault, admin, depositor, withdrawer, stranger;

  beforeEach(async () => {
    [admin, depositor, withdrawer, stranger] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("VaultWithRoles");
    vault = await Vault.deploy(admin.address);

    const DEPOSITOR_ROLE = await vault.DEPOSITOR_ROLE();
    const WITHDRAWER_ROLE = await vault.WITHDRAWER_ROLE();
    await vault.connect(admin).grantRole(DEPOSITOR_ROLE, depositor.address);
    await vault.connect(admin).grantRole(WITHDRAWER_ROLE, withdrawer.address);
  });

  it("depositor can deposit ETH", async () => {
    await vault.connect(depositor).deposit({ value: ethers.parseEther("1") });
    expect(await vault.getBalance()).to.equal(ethers.parseEther("1"));
  });

  it("reverts deposit from non-depositor", async () => {
    await expect(
      vault.connect(stranger).deposit({ value: ethers.parseEther("1") })
    ).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
  });

  it("withdrawer can withdraw ETH", async () => {
    await vault.connect(depositor).deposit({ value: ethers.parseEther("2") });
    const before = await ethers.provider.getBalance(withdrawer.address);
    const tx = await vault.connect(withdrawer).withdraw(withdrawer.address, ethers.parseEther("1"));
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const after = await ethers.provider.getBalance(withdrawer.address);
    expect(after - before + gasUsed).to.equal(ethers.parseEther("1"));
  });

  it("reverts withdrawal from non-withdrawer", async () => {
    await vault.connect(depositor).deposit({ value: ethers.parseEther("1") });
    await expect(
      vault.connect(stranger).withdraw(stranger.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
  });

  it("reverts withdrawal when balance is insufficient", async () => {
    await vault.connect(depositor).deposit({ value: ethers.parseEther("1") });
    await expect(
      vault.connect(withdrawer).withdraw(withdrawer.address, ethers.parseEther("5"))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("admin can revoke roles", async () => {
    const DEPOSITOR_ROLE = await vault.DEPOSITOR_ROLE();
    await vault.connect(admin).revokeRole(DEPOSITOR_ROLE, depositor.address);
    await expect(
      vault.connect(depositor).deposit({ value: ethers.parseEther("1") })
    ).to.be.revertedWithCustomError(vault, "AccessControlUnauthorizedAccount");
  });
});
