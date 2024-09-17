import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DIDRegistry } from "../typechain-types";

import { expect } from "chai";
import { AddressLike, Typed } from "ethers";
import { ethers } from "hardhat";

describe("DIDRegistryTest", function () {
  let registry: DIDRegistry;
  let owner: HardhatEthersSigner;
  let account1: HardhatEthersSigner;
  let account2: HardhatEthersSigner;
  let delegate: { address: AddressLike | Typed };
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
    [owner, account1, account2, delegate] = await ethers.getSigners();
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    registry = await DIDRegistry.deploy();
  });

  it("should register a DID correctly", async function () {
    // Register the DID
    await registry.register(DID, account1.address, DOC);

    // Verify the DID is registered correctly
    const [owner, document] = await registry.resolve(DID);
    expect(owner).to.equal(account1.address);
    expect(document).to.equal(DOC);
  });

  // Uncomment the following block to test for failure on registering an existing DID

  // it("should fail to register an existing DID", async function () {
  //   // Register the DID first
  //   await registry.register(DID, t_addr, DOC);

  //   // Attempt to register the same DID again should fail
  //   await expect(registry.register(DID, t_addr, DOC)).to.be.revertedWith("DID already registered");
  // });

  describe("Delegate Management", function () {
    beforeEach(async function () {
      // Register a DID for account1
      await registry.connect(account1).register(DID, account1.address, DOC);
    });

    it("should register a delegate", async function () {
      await expect(
        registry
          .connect(account1)
          .registerDelegate(account1.address, delegate.address)
      )
        .to.emit(registry, "DelegateRegistered")
        .withArgs(account1.address, delegate.address);
    });

    it("should allow owner to register a delegate for an account", async function () {
      await expect(
        registry
          .connect(account1)
          .registerDelegate(account1.address, delegate.address)
      )
        .to.emit(registry, "DelegateRegistered")
        .withArgs(account1.address, delegate.address);
    });

    it("should not allow non-owner to register a delegate for another account", async function () {
      await expect(
        registry
          .connect(account2)
          .registerDelegate(account1.address, delegate.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should void a delegate", async function () {
      // First, register a delegate
      await registry
        .connect(account1)
        .registerDelegate(account1.address, delegate.address);

      // Then, void the delegate
      await expect(registry.connect(account1).voidDelegate(delegate.address))
        .to.emit(registry, "DelegateVoided")
        .withArgs(account1.address, delegate.address);
    });

    it("should not allow voiding a non-existent delegate", async function () {
      // Attempt to void a delegate that hasn't been registered
      await expect(
        registry.connect(account1).voidDelegate(delegate.address)
      ).to.not.emit(registry, "DelegateVoided");
    });
  });
});
