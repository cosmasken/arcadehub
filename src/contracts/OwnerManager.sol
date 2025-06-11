pragma solidity ^0.8.20;

contract OwnerManager {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public ownerCount;

    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    constructor(address[] memory initialOwners) {
        for (uint i = 0; i < initialOwners.length; i++) {
            isOwner[initialOwners[i]] = true;
            owners.push(initialOwners[i]);
        }
        ownerCount = initialOwners.length;
    }

    function addOwner(address newOwner) external onlyOwner {
        require(!isOwner[newOwner], "Already an owner");
        isOwner[newOwner] = true;
        owners.push(newOwner);
        ownerCount++;
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address ownerToRemove) external onlyOwner {
        require(isOwner[ownerToRemove], "Not an owner");
        require(ownerCount > 1, "Cannot remove last owner");
        isOwner[ownerToRemove] = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == ownerToRemove) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }
        ownerCount--;
        emit OwnerRemoved(ownerToRemove);
    }

}