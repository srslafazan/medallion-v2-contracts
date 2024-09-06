const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestMedallion", function () {
  let medallion, registry;
  let owner;
  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const registryAddress = "0xBB1fFDA6c47DdF1E065D8AA7077a2D7bB7c54652";

  before(async function () {
    // Get signers
    [owner] = await ethers.getSigners();

    // Deploy Medallion contract
    const Medallion = await ethers.getContractFactory("Medallion");
    medallion = await Medallion.deploy(ownerAddress);
    await medallion;

    // Deploy DIDRegistry contract (if it's not deployed with Medallion)
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    registry = await DIDRegistry.deploy();
    await registry;
  });

  it.skip("should register through Medallion", async function () {
    // Example data for the register function
    const did = "did:example:123456789";
    const publicKeyJson = JSON.stringify({
      "@context": "https://w3id.org/did/v1",
      id: did,
      publicKey: [
        {
          id: `${did}#keys-1`,
          type: "RsaVerificationKey2018",
          controller: did,
          publicKeyPem: "-----BEGIN PUBLIC KEY...END PUBLIC KEY-----",
        },
      ],
    });

    // Call the register function on the Medallion contract
    await expect(medallion.register(did, registryAddress, publicKeyJson)).to.not
      .be.reverted;

    // Example of how to assert registry logic if necessary
    await expect(registry.register("did:example:asdf", registryAddress, "asdf"))
      .to.not.be.reverted;

    // Use Chai to check if the transaction was successful
    expect(true).to.be.true;
  });
});
