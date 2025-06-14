// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PointsSystem is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    uint256 public pointsToTokensRate = 1000;

    struct PointsClaim {
        uint256 points;
        bool approved;
        bool rejected;
    }

    // User address => array of claims
    mapping(address => PointsClaim[]) public userClaims;
    // User address => total approved points (ready to claim)
    mapping(address => uint256) public userPoints;
    // Admin management
    mapping(address => bool) public isAdmin;

    event PointsClaimSubmitted(address indexed player, uint256 indexed claimIndex, uint256 points);
    event PointsClaimApproved(address indexed player, uint256 indexed claimIndex, uint256 points);
    event PointsClaimRejected(address indexed player, uint256 indexed claimIndex);
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

    function setPointsToTokensRate(uint256 _newRate) external onlyAdmin {
        require(_newRate > 0, "Rate must be greater than zero");
        pointsToTokensRate = _newRate;
    }

    function depositTokens(uint256 amount) external onlyAdmin {
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit TokensDeposited(msg.sender, amount);
    }

    function submitPointsClaim(uint256 points) external {
        require(points > 0, "Points must be greater than zero");
        userClaims[msg.sender].push(PointsClaim({
            points: points,
            approved: false,
            rejected: false
        }));
        uint256 claimIndex = userClaims[msg.sender].length - 1;
        emit PointsClaimSubmitted(msg.sender, claimIndex, points);
    }

    function approvePointsClaim(address player, uint256 claimIndex) external onlyAdmin nonReentrant {
        require(claimIndex < userClaims[player].length, "Invalid claim index");
        PointsClaim storage claim = userClaims[player][claimIndex];
        require(!claim.approved && !claim.rejected, "Already processed");
        claim.approved = true;
        userPoints[player] += claim.points;
        emit PointsClaimApproved(player, claimIndex, claim.points);
    }

    function rejectPointsClaim(address player, uint256 claimIndex) external onlyAdmin {
        require(claimIndex < userClaims[player].length, "Invalid claim index");
        PointsClaim storage claim = userClaims[player][claimIndex];
        require(!claim.approved && !claim.rejected, "Already processed");
        claim.rejected = true;
        emit PointsClaimRejected(player, claimIndex);
    }

    function claimTokens() external nonReentrant {
        uint256 points = userPoints[msg.sender];
        require(points > 0, "No points to claim");
        uint256 tokens = points * pointsToTokensRate;
        userPoints[msg.sender] = 0;
        require(arcToken.transfer(msg.sender, tokens), "Transfer failed");
        emit TokensClaimed(msg.sender, tokens);
    }

    // View function to get the number of claims for a user
    function getClaimsCount(address player) external view returns (uint256) {
        return userClaims[player].length;
    }

    // View function to get a specific claim for a user
    function getClaim(address player, uint256 claimIndex) external view returns (uint256 points, bool approved, bool rejected) {
        require(claimIndex < userClaims[player].length, "Invalid claim index");
        PointsClaim storage claim = userClaims[player][claimIndex];
        return (claim.points, claim.approved, claim.rejected);
    }

    // New function to check contract's token balance
    function getContractTokenBalance() external view returns (uint256) {
        return arcToken.balanceOf(address(this));
    }
}