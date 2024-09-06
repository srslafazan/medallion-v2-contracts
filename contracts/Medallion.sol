// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./MedallionDIDRegistry.sol";

// interface MedallionAchievementContract {
//     function register(string memory did, address account, string memory document) external;
//     function issue(address recipient, bytes32 credential) external;
//     function revoke(address recipient, bytes32 credential) external;
//     function createSchema(bytes32 schema) external;
// }

contract Medallion {
    DIDRegistry public didRegistry;
    // MedallionAchievementContract public achievementContract;

    constructor(address _didRegistry) {
        // address _achievementContract
        didRegistry = DIDRegistry(_didRegistry);
        // achievementContract = MedallionAchievementContract(_achievementContract);
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
