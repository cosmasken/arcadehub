pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PointsManager {
    IERC20 public arcToken;
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public pendingPointsClaims;
    uint256 public pointsToTokensRate = 1000;

    event PointsClaimSubmitted(address indexed player, uint256 points);
    event PointsClaimApproved(address indexed player, uint256 points);
    event PointsClaimRejected(address indexed player);
    event TokensClaimed(address indexed player, uint256 amount);

    constructor(address _arcToken) {
        arcToken = IERC20(_arcToken);
    }

    function submitPointsClaim(uint256 points) external {
        require(pendingPointsClaims[msg.sender] == 0, "Pending claim exists");
        pendingPointsClaims[msg.sender] = points;
        emit PointsClaimSubmitted(msg.sender, points);
    }

    
    function approvePointsClaim(address player) external onlyOwner nonReentrant {
    uint256 points = pendingPointsClaims[player];
    require(points > 0, "No pending claim");
    pendingPointsClaims[player] = 0;
    uint256 tokens = points * pointsToTokensRate;
    require(arcToken.transfer(player, tokens), "Transfer failed");
    emit PointsClaimApproved(player, points);
    emit TokensClaimed(player, tokens);
    }

    // Reject points claim
    function rejectPointsClaim(address player) external onlyOwner {
        require(pendingPointsClaims[player] > 0, "No pending claim");
        pendingPointsClaims[player] = 0;
        emit PointsClaimRejected(player);
    }

    // Claim tokens from points
    function claimTokens() external nonReentrant {
        uint256 points = userPoints[msg.sender];
        require(points > 0, "No points to claim");
        uint256 tokens = points * pointsToTokensRate;
        userPoints[msg.sender] = 0;
        require(arcToken.transfer(msg.sender, tokens), "Transfer failed");
        emit TokensClaimed(msg.sender, tokens);
    }

}