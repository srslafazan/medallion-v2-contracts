const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DIDRegistryTest", function () {
  let registry;
  const t_addr = "0xbB1FFdA6c47Ddf1E065d8aA7077a2d7bb7C54651";
  const DID = "did:example:123456789abcdefghi";
  const DOC = JSON.stringify({
    "@context": "https://w3id.org/did/v1",
    id: "did:example:123456789abcdefghi",
    publicKey: [
      {
        id: "did:example:123456789abcdefghi#keys-1",
        type: "RsaVerificationKey2018",
        controller: "did:example:123456789abcdefghi",
        publicKeyPem: "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----",
      },
    ],
  });

  beforeEach(async function () {
    // Deploy the DIDRegistry contract before each test
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    registry = await DIDRegistry.deploy();
    await registry;
  });

  it("should register a DID correctly", async function () {
    // Register the DID
    await registry.register(DID, t_addr, DOC);

    // Verify the DID is registered correctly
    const [owner, document] = await registry.resolve(DID);
    expect(owner).to.equal(t_addr);
    expect(document).to.equal(DOC);
  });

  // Uncomment the following block to test for failure on registering an existing DID

  // it("should fail to register an existing DID", async function () {
  //   // Register the DID first
  //   await registry.register(DID, t_addr, DOC);

  //   // Attempt to register the same DID again should fail
  //   await expect(registry.register(DID, t_addr, DOC)).to.be.revertedWith("DID already registered");
  // });
});
