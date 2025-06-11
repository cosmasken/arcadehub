// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OwnerManager.sol";
import "./GameManager.sol";
import "./PointsManager.sol";
import "./DeveloperRevenue.sol";
import "./StakingManager.sol";
import "./AdminApplication.sol";
import "./NFTManager.sol";
import "./TournamentManager.sol";

contract ArcadeHub is 
    OwnerManager, 
    GameManager, 
    PointsManager, 
    DeveloperRevenue, 
    StakingManager, 
    AdminApplication, 
    NFTManager, 
    TournamentManager 
{
    constructor(
        address _arcToken, 
        address _nftContract, 
        address[] memory initialOwners
    )
        OwnerManager(initialOwners)
        PointsManager(_arcToken)
        NFTManager(_nftContract)
    {}
}