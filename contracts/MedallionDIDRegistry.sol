// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    struct DID {
        address owner;
        string document;
    }

    mapping(string => DID) private dids;
    mapping(address => DID) private addressToDid;

    mapping(address => address[]) private delegates;

    event DIDRegistered(
        string indexed did,
        address indexed owner,
        string document
    );
    event DIDUpdated(
        string indexed did,
        address indexed owner,
        string document
    );
    event DIDTransferred(
        string indexed did,
        address indexed previousOwner,
        address indexed newOwner
    );
    event DelegateRegistered(address indexed account, address indexed delegate);
    event DelegateVoided(address indexed account, address indexed delegate);

    modifier onlyOwner(string memory did) {
        require(
            dids[did].owner == msg.sender,
            "Only the owner can perform this action"
        );
        _;
    }

    function register(
        string memory _did,
        address _account,
        string memory _document
    ) public {
        require(dids[_did].owner == address(0), "DID already registered");

        dids[_did] = DID({owner: _account, document: _document});

        emit DIDRegistered(_did, msg.sender, _document);
    }

    function update(
        string memory did,
        string memory document
    ) public onlyOwner(did) {
        dids[did].document = document;
        emit DIDUpdated(did, msg.sender, document);
    }

    function resolve(
        string memory did
    ) public view returns (address owner, string memory document) {
        require(dids[did].owner != address(0), "DID not registered");

        DID memory didRecord = dids[did];
        return (didRecord.owner, didRecord.document);
    }

    function registerDelegate(address account, address delegate) public {
        require(
            msg.sender == account || msg.sender == addressToDid[account].owner,
            "Not authorized"
        );
        delegates[account].push(delegate);
        emit DelegateRegistered(account, delegate);
    }

    function voidDelegate(address delegate) public {
        address[] storage accountDelegates = delegates[msg.sender];
        for (uint i = 0; i < accountDelegates.length; i++) {
            if (accountDelegates[i] == delegate) {
                accountDelegates[i] = accountDelegates[
                    accountDelegates.length - 1
                ];
                accountDelegates.pop();
                emit DelegateVoided(msg.sender, delegate);
                break;
            }
        }
    }
}
