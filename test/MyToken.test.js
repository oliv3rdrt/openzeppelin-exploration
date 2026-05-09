const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let token, owner, minter, user;

  beforeEach(async () => {
    [owner, minter, user] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy(owner.address, minter.address);
  });

  it("grants MINTER_ROLE to minter address", async () => {
    const MINTER_ROLE = await token.MINTER_ROLE();
    expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
  });

  it("allows minter to mint tokens", async () => {
    await token.connect(minter).mint(user.address, ethers.parseEther("100"));
    expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
  });

  it("reverts when non-minter tries to mint", async () => {
    await expect(
      token.connect(user).mint(user.address, ethers.parseEther("100"))
    ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("allows pauser to pause and unpause", async () => {
    // mint before pausing so user has a balance to attempt transfer
    await token.connect(minter).mint(user.address, ethers.parseEther("10"));
    await token.connect(owner).pause();

    // transfers should fail while paused
    await expect(
      token.connect(user).transfer(owner.address, ethers.parseEther("1"))
    ).to.be.revertedWithCustomError(token, "EnforcedPause");

    await token.connect(owner).unpause();
    await token.connect(user).transfer(owner.address, ethers.parseEther("1"));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1"));
  });
});
