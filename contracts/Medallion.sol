// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./MedallionDIDRegistry.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// interface MedallionAchievementContract {
//     function register(string memory did, address account, string memory document) external;
//     function issue(address recipient, bytes32 credential) external;
//     function revoke(address recipient, bytes32 credential) external;
//     function createSchema(bytes32 schema) external;
// }

contract Medallion is ERC721, Ownable{
    DIDRegistry public didRegistry;
    // MedallionAchievementContract public achievementContract;

//a very basic Issuer structure. will have a more complex structure.
      struct Issuer {
        bool isIssuer;
        bool isActive;
    }

    mapping(address => Issuer) public issuers;

    constructor(address _didRegistry) Ownable(msg.sender) ERC721("Medallion", "MDL") {
        // address _achievementContract
        didRegistry = DIDRegistry(_didRegistry);
        // achievementContract = MedallionAchievementContract(_achievementContract);
    }

    modifier onlyAdmin() {
        require(owner() == msg.sender, "Only admin can perform this action");
        _;
    }


    modifier onlyIssuer() {
        require(issuers[msg.sender].isIssuer == true && issuers[msg.sender].isActive == true, "Only active issuers can perform this action");
        _;
    }

    function addIssuer(address issuerAddress) public onlyAdmin {
        require(!issuers[issuerAddress].isIssuer, "Already an issuer");
        issuers[issuerAddress] = Issuer({isIssuer: true, isActive: true});
        //emit IssuerAdded(issuerAddress);
    }

    function removeIssuer(address issuerAddress) public onlyAdmin {
        require(issuers[issuerAddress].isIssuer, "Not an issuer");
        issuers[issuerAddress].isActive = false;
        //emit IssuerRemoved(issuerAddress);
    }

    function registerAchiever(address achiever) public onlyIssuer {
        // Mint a new Medallion token to the Achiever
        
    }

    function register(
        string memory _did,
        address _account,
        string memory _document
    ) public {
        return didRegistry.register(_did, _account, _document);
    }

    // function registerDelegate(address account, address delegate) external {
    //     didRegistry.registerDelegate(account, delegate);
    // }

    // function voidDelegate(address delegate) external {
    //     didRegistry.voidDelegate(delegate);
    // }

    // function issue(address recipient, bytes32 credential) external {
    //     achievementContract.issue(recipient, credential);
    // }

    // function revoke(address recipient, bytes32 credential) external {
    //     achievementContract.revoke(recipient, credential);
    // }

    // function createSchema(bytes32 schema) external {
    //     achievementContract.createSchema(schema);
    // }
}
