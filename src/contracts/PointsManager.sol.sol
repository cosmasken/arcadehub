// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PointsSystem is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public pendingPointsClaims;
    uint256 public pointsToTokensRate = 1000;

    mapping(address => bool) public isAdmin;


    event PointsClaimSubmitted(address indexed player, uint256 points);
    event PointsClaimApproved(address indexed player, uint256 points);
    event PointsClaimRejected(address indexed player);
    event TokensClaimed(address indexed player, uint256 amount);
    event TokensDeposited(address indexed owner, uint256 amount);

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor(address _arcToken, address _initialOwner) Ownable(_initialOwner) {
        require(_arcToken != address(0), "Invalid token address");
        arcToken = IERC20(_arcToken);
        isAdmin[_initialOwner] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Caller is not an admin");
        _;
    }
    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid admin address");
        require(!isAdmin[admin], "Already an admin");
        isAdmin[admin] = true;
        emit AdminAdded(admin);
    }
    function removeAdmin(address admin) external onlyOwner {
        require(isAdmin[admin], "Not an admin");
        isAdmin[admin] = false;
        emit AdminRemoved(admin);
    }

    function setPointsToTokensRate(uint256 _newRate) external onlyAdmin() {
        require(_newRate > 0, "Rate must be greater than zero");
        pointsToTokensRate = _newRate;
    }

    function depositTokens(uint256 amount) external onlyAdmin() {
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit TokensDeposited(msg.sender, amount);
    }

    function submitPointsClaim(uint256 points) external {
        require(points > 0, "Points must be greater than zero");
        require(pendingPointsClaims[msg.sender] == 0, "Pending claim exists");
        pendingPointsClaims[msg.sender] = points;
        emit PointsClaimSubmitted(msg.sender, points);
    }

    function approvePointsClaim(address player) external onlyAdmin() nonReentrant {
        uint256 points = pendingPointsClaims[player];
        require(points > 0, "No pending claim");
        pendingPointsClaims[player] = 0;
        uint256 tokens = points * pointsToTokensRate;
        require(arcToken.transfer(player, tokens), "Transfer failed");
        emit PointsClaimApproved(player, points);
        emit TokensClaimed(player, tokens);
    }

    function rejectPointsClaim(address player) external onlyAdmin() {
        require(pendingPointsClaims[player] > 0, "No pending claim");
        pendingPointsClaims[player] = 0;
        emit PointsClaimRejected(player);
    }

    function claimTokens() external nonReentrant {
        uint256 points = userPoints[msg.sender];
        require(points > 0, "No points to claim");
        uint256 tokens = points * pointsToTokensRate;
        userPoints[msg.sender] = 0;
        require(arcToken.transfer(msg.sender, tokens), "Transfer failed");
        emit TokensClaimed(msg.sender, tokens);
    }
}