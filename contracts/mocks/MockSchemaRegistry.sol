// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ISchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/ISchemaResolver.sol";

contract MockSchemaRegistry {
    function register(
        string calldata schema,
        ISchemaResolver resolver,
        bool revocable
    ) external returns (bytes32) {
        // For testing purposes, we'll just return a constant value
        return bytes32(0);
    }

    // Implement other required functions if needed...
}
