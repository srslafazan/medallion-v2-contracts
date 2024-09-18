// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./MedallionDIDRegistry.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEAS, AttestationRequest, AttestationRequestData, RevocationRequest, RevocationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/SchemaRegistry.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {ISchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/ISchemaResolver.sol";

contract MedallionRouter is Ownable {
    DIDRegistry public didRegistry;
    IEAS private _eas;
    SchemaRegistry private _schemaRegistry;

    struct Issuer {
        bool isIssuer;
        bool isActive;
    }

    mapping(address => Issuer) public issuers;

    event SchemaCreated(bytes32 indexed schemaId, bytes32 schema);
    event SchemaRegistrationAttempt(
        string schema,
        address resolver,
        bool revocable
    );
    event AttestationIssued(
        bytes32 indexed attestationId,
        address indexed issuer,
        address indexed subject
    );
    event AttestationRevoked(
        bytes32 indexed attestationId,
        address indexed revoker
    );

    constructor(
        address _didRegistry,
        address _easAddress,
        address _schemaRegistryAddress
    ) Ownable(msg.sender) {
        didRegistry = DIDRegistry(_didRegistry);
        _eas = IEAS(_easAddress);
        _schemaRegistry = SchemaRegistry(_schemaRegistryAddress);
    }

    modifier onlyAdmin() {
        require(owner() == msg.sender, "Only admin can perform this action");
        _;
    }

    modifier onlyIssuer() {
        require(
            issuers[msg.sender].isIssuer && issuers[msg.sender].isActive,
            "Only active issuers can perform this action"
        );
        _;
    }

    function addIssuer(address issuerAddress) public onlyAdmin {
        require(!issuers[issuerAddress].isIssuer, "Already an issuer");
        issuers[issuerAddress] = Issuer({isIssuer: true, isActive: true});
        // TODO: Emit IssuerAdded event
    }

    function removeIssuer(address issuerAddress) public onlyAdmin {
        require(issuers[issuerAddress].isIssuer, "Not an issuer");
        issuers[issuerAddress].isActive = false;
        // TODO: Emit IssuerRemoved event
    }

    function registerAchiever(address achiever) public onlyIssuer {
        // TODO: Implement minting of a new Medallion token to the Achiever
    }

    function register(
        string memory _did,
        address _account,
        string memory _document
    ) public {
        didRegistry.register(_did, _account, _document);
    }

    function registerDelegate(address account, address delegate) external {
        didRegistry.registerDelegate(account, delegate);
    }

    function voidDelegate(address delegate) external {
        didRegistry.voidDelegate(delegate);
    }

    function createSchema(
        string memory _schema,
        address _resolver,
        bool _revocable
    ) external returns (bytes32) {
        emit SchemaRegistrationAttempt(_schema, _resolver, _revocable);
        try
            _schemaRegistry.register(
                _schema,
                ISchemaResolver(_resolver),
                _revocable
            )
        returns (bytes32 schemaId) {
            emit SchemaCreated(schemaId, keccak256(bytes(_schema)));
            return schemaId;
        } catch Error(string memory reason) {
            revert(
                string(abi.encodePacked("Schema registration failed: ", reason))
            );
        } catch (bytes memory lowLevelData) {
            revert("Schema registration failed with low-level error");
        }
    }

    function issue(
        address subject,
        bytes32 schemaId,
        bytes memory data
    ) external onlyIssuer returns (bytes32) {
        bytes32 attestationId = _eas.attest(
            AttestationRequest({
                schema: schemaId,
                data: AttestationRequestData({
                    recipient: subject,
                    expirationTime: 0,
                    revocable: true,
                    refUID: bytes32(0),
                    data: data,
                    value: 0
                })
            })
        );

        emit AttestationIssued(attestationId, msg.sender, subject);
        return attestationId;
    }

    function revoke(bytes32 attestationId) external onlyIssuer {
        _eas.revoke(
            RevocationRequest({
                schema: bytes32(0), // The schema is not needed for revocation
                data: RevocationRequestData({uid: attestationId, value: 0})
            })
        );

        emit AttestationRevoked(attestationId, msg.sender);
    }
}
