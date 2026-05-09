const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let nft, owner, user;
  const TOKEN_URI = "ipfs://QmTestHashABCDEF1234567890";

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy(owner.address);
  });

  it("mints a token with the correct URI", async () => {
    const tokenId = await nft.safeMint.staticCall(user.address, TOKEN_URI);
    await nft.safeMint(user.address, TOKEN_URI);
    expect(await nft.ownerOf(tokenId)).to.equal(user.address);
    expect(await nft.tokenURI(tokenId)).to.equal(TOKEN_URI);
  });

  it("increments token IDs sequentially", async () => {
    const id0 = await nft.safeMint.staticCall(user.address, "ipfs://A");
    await nft.safeMint(user.address, "ipfs://A");
    const id1 = await nft.safeMint.staticCall(user.address, "ipfs://B");
    await nft.safeMint(user.address, "ipfs://B");
    expect(id0).to.equal(0n);
    expect(id1).to.equal(1n);
  });

  it("reverts mint from non-owner", async () => {
    await expect(
      nft.connect(user).safeMint(user.address, TOKEN_URI)
    ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
  });

  it("supports ERC-165 interface detection", async () => {
    const ERC721_INTERFACE_ID = "0x80ac58cd";
    expect(await nft.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
  });
});
