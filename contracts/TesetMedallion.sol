// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SchemaRegistry} from "../eas-contracts/SchemaRegistry.sol";
import {ISchemaResolver} from "../eas-contracts/resolver/ISchemaResolver.sol";

contract Medallion is Ownable {
  SchemaRegistry private _schemaRegistry;
    struct Issuer {
        bool isIssuer;
        bool isActive;
    }

     mapping(address => Issuer) public issuers;

      constructor(
       // address _didRegistry,
      //  address _easAddress,
        address _schemaRegistryAddress
    ) Ownable(msg.sender) {
      //  didRegistry = DIDRegistry(_didRegistry);
       // _eas = IEAS(_easAddress);
        _schemaRegistry = SchemaRegistry(_schemaRegistryAddress);
    }
     

    //  event SchemaCreated(bytes32 indexed schemaId, bytes32 schema);
    // event SchemaRegistrationAttempt(
    //     string schema,
    //     address resolver,
    //     bool revocable
    // );
    // event AttestationIssued(
    //     bytes32 indexed attestationId,
    //     address indexed issuer,
    //     address indexed subject
    // );
    // event AttestationRevoked(
    //     bytes32 indexed attestationId,
    //     address indexed revoker
    // );

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

    function run() external {
       
        // Create new EAS schema
         _schemaRegistry.register(
            "string name, string description",
            ISchemaResolver(address(0)),
            true
        );
        //vm.stopBroadcast();
    }

    function removeIssuer(address issuerAddress) public onlyAdmin {
        require(issuers[issuerAddress].isIssuer, "Not an issuer");
        issuers[issuerAddress].isActive = false;
        // TODO: Emit IssuerRemoved event
    }

    function registerAchiever(address achiever) public onlyIssuer {
        // TODO: Implement minting of a new Medallion token to the Achiever
    }

}