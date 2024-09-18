import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DIDRegistry, Medallion } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TestMedallion", function () {
  let medallion: Medallion;
  let registry: DIDRegistry;
  let owner: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let easAddress: string;
  let schemaRegistryAddress: string;

  beforeEach(async function () {
    // Get signers
    [owner, issuer] = await ethers.getSigners();

    // Deploy DIDRegistry contract
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    registry = await DIDRegistry.deploy();
    await registry.waitForDeployment();

    // Use placeholder addresses for EAS and SchemaRegistry
    easAddress = ethers.ZeroAddress; // Replace with actual MockEAS address if needed
    schemaRegistryAddress = ethers.ZeroAddress; // Replace with actual SchemaRegistry address if needed

    // Deploy Medallion contract
    const Medallion = await ethers.getContractFactory("Medallion");
    medallion = await Medallion.deploy(
      await registry.getAddress(),
      easAddress,
      schemaRegistryAddress
    );
    await medallion.waitForDeployment();
  });

  it("should register through Medallion", async function () {
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

    await expect(
      medallion.register(did, await owner.getAddress(), publicKeyJson)
    ).to.not.be.reverted;

    await expect(
      registry.register("did:example:asdf", await owner.getAddress(), "asdf")
    ).to.not.be.reverted;
  });

  it("should add an issuer", async function () {
    await expect(medallion.connect(owner).addIssuer(await issuer.getAddress()))
      .to.not.be.reverted;

    const issuerInfo = await medallion.issuers(await issuer.getAddress());
    expect(issuerInfo.isIssuer).to.be.true;
    expect(issuerInfo.isActive).to.be.true;
  });

  it("should not allow non-admin to add an issuer", async function () {
    await expect(
      medallion.connect(issuer).addIssuer(await issuer.getAddress())
    ).to.be.revertedWith("Only admin can perform this action");
  });

  it("should remove an issuer", async function () {
    await medallion.connect(owner).addIssuer(await issuer.getAddress());

    await expect(
      medallion.connect(owner).removeIssuer(await issuer.getAddress())
    ).to.not.be.reverted;

    const issuerInfo = await medallion.issuers(await issuer.getAddress());
    expect(issuerInfo.isIssuer).to.be.true;
    expect(issuerInfo.isActive).to.be.false;
  });

  it("should not allow non-admin to remove an issuer", async function () {
    await medallion.connect(owner).addIssuer(await issuer.getAddress());

    await expect(
      medallion.connect(issuer).removeIssuer(await issuer.getAddress())
    ).to.be.revertedWith("Only admin can perform this action");
  });

  it("should register an achiever", async function () {
    await medallion.connect(owner).addIssuer(await issuer.getAddress());
    const achiever = ethers.Wallet.createRandom().address;

    await expect(medallion.connect(issuer).registerAchiever(achiever)).to.not.be.reverted;
  });

  it("should not allow non-issuer to register an achiever", async function () {
    const achiever = ethers.Wallet.createRandom().address;

    await expect(
      medallion.connect(issuer).registerAchiever(achiever)
    ).to.be.revertedWith("Only active issuers can perform this action");
  });

  it("should create a schema", async function () {
    const schema = "uint256 achievementId";
    const resolverAddress = await medallion.getAddress();
    const revocable = true;

    const tx = await medallion.connect(owner).createSchema(schema, resolverAddress, revocable);
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1); // Check if the transaction was successful

    // Get the return value (schemaId) from the transaction
    const schemaId = await tx;
    expect(schemaId).to.be.a("string").and.to.have.lengthOf(66); // 0x + 64 hex characters

    // Verify the emitted event
    const events = await medallion.queryFilter(
      medallion.filters.SchemaCreated(),
      receipt?.blockNumber
    );
    expect(events.length).to.equal(1);
    const [event] = events;
    expect(event.args.schemaId).to.equal(schemaId);
    expect(event.args.schema).to.equal(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes(schema))
    );
  });

  it("should issue an attestation", async function () {
    const subject = await owner.getAddress();
    const schemaId = ethers.utils.formatBytes32String("exampleSchema");
    const data = ethers.utils.toUtf8Bytes("Some data");

    const attestationId = await medallion.issue(subject, schemaId, data);
    expect(attestationId).to.be.a("string").and.to.have.lengthOf(66); // 0x + 64 hex characters

    // Verify the emitted event
    await expect(medallion.issue(subject, schemaId, data))
      .to.emit(medallion, "AttestationIssued")
      .withArgs(attestationId, issuer.address, subject);
  });

  it("should revoke an attestation", async function () {
    const subject = await owner.getAddress();
    const schemaId = ethers.utils.formatBytes32String("exampleSchema");
    const data = ethers.utils.toUtf8Bytes("Some data");

    const attestationId = await medallion.issue(subject, schemaId, data);

    await expect(medallion.revoke(attestationId)).to.not.be.reverted;

    // Verify the emitted event
    await expect(medallion.revoke(attestationId))
      .to.emit(medallion, "AttestationRevoked")
      .withArgs(attestationId, issuer.address);
  });

  it("should not allow non-issuer to issue an attestation", async function () {
    const subject = await owner.getAddress();
    const schemaId = ethers.utils.formatBytes32String("exampleSchema");
    const data = ethers.utils.toUtf8Bytes("Some data");

    await expect(
      medallion.connect(owner).issue(subject, schemaId, data)
    ).to.be.revertedWith("Only active issuers can perform this action");
  });

  it("should not allow non-issuer to revoke an attestation", async function () {
    const subject = await owner.getAddress();
    const schemaId = ethers.utils.formatBytes32String("exampleSchema");
    const data = ethers.utils.toUtf8Bytes("Some data");

    const attestationId = await medallion.issue(subject, schemaId, data);

    await expect(
      medallion.connect(owner).revoke(attestationId)
    ).to.be.revertedWith("Only active issuers can perform this action");
  });
});
