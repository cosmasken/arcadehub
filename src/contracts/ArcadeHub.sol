// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface INFTContract is IERC721 {
    function mint(address to) external;
}

contract ArcadeHub is ReentrancyGuard {
    IERC20 public arcToken;
    INFTContract public nftContract;

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public ownerCount;

    // Game submission
    struct Game {
        uint256 gameId;
        string name;
        string ipfsHash;
    }
    mapping(uint256 => Game) public games;
    mapping(uint256 => bool) public gameIdExists; // Tracks used gameIds

    // Points system
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public pendingPointsClaims;
    uint256 public pointsToTokensRate = 1; // 1 point = 1 ARC token

    // Developer revenue
    mapping(address => uint256) public developerBalances;

    // Staking
    mapping(address => uint256) public stakedBalances;

    // Admin application
    uint256 public adminApplicationStake = 1000; // Minimum stake to apply
    mapping(address => bool) public pendingApplications;

    // Events
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event GameSubmitted(uint256 indexed gameId, address indexed developer, string name, string ipfsHash);
    event PointsClaimSubmitted(address indexed player, uint256 points);
    event PointsClaimApproved(address indexed player, uint256 points);
    event PointsClaimRejected(address indexed player);
    event TokensClaimed(address indexed player, uint256 amount);
    event DeveloperRevenueAllocated(address indexed developer, uint256 amount);
    event DeveloperPayoutClaimed(address indexed developer, uint256 amount);
    event ARCTransferred(address indexed from, address indexed to, uint256 amount);
    event NFTTransferred(address indexed from, address indexed to, uint256 tokenId);
    event NFTMinted(address indexed player);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event AdminApplicationSubmitted(address indexed applicant);
    event AdminApplicationAccepted(address indexed applicant);
    event AdminApplicationRejected(address indexed applicant);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    constructor(address _arcToken, address _nftContract, address[] memory initialOwners) {
        arcToken = IERC20(_arcToken);
        nftContract = INFTContract(_nftContract);
        for (uint i = 0; i < initialOwners.length; i++) {
            isOwner[initialOwners[i]] = true;
            owners.push(initialOwners[i]);
        }
        ownerCount = initialOwners.length;
    }

    // Owner management
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

    // Submit a game
    function submitGame(uint256 gameId, string calldata name, string calldata ipfsHash) external {
        require(!gameIdExists[gameId], "Game ID already exists");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        gameIdExists[gameId] = true;
        games[gameId] = Game(gameId, name, ipfsHash);
        emit GameSubmitted(gameId, msg.sender, name, ipfsHash);
    }


    // Submit points claim
    function submitPointsClaim(uint256 points) external {
        require(pendingPointsClaims[msg.sender] == 0, "Pending claim exists");
        pendingPointsClaims[msg.sender] = points;
        emit PointsClaimSubmitted(msg.sender, points);
    }

    // Approve points claim
    function approvePointsClaim(address player) external onlyOwner {
        uint256 points = pendingPointsClaims[player];
        require(points > 0, "No pending claim");
        pendingPointsClaims[player] = 0;
        userPoints[player] += points;
        emit PointsClaimApproved(player, points);
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

    // Allocate revenue to developers
    function allocateDeveloperRevenue(address developer, uint256 amount) external onlyOwner {
        developerBalances[developer] += amount;
        emit DeveloperRevenueAllocated(developer, amount);
    }

    // Claim developer payout
    function claimDeveloperPayout() external nonReentrant {
        uint256 amount = developerBalances[msg.sender];
        require(amount > 0, "No payout available");
        developerBalances[msg.sender] = 0;
        require(arcToken.transfer(msg.sender, amount), "Transfer failed");
        emit DeveloperPayoutClaimed(msg.sender, amount);
    }

    // Transfer ARC tokens
    function transferARC(address to, uint256 amount) external nonReentrant {
        require(arcToken.transferFrom(msg.sender, to, amount), "Transfer failed");
        emit ARCTransferred(msg.sender, to, amount);
    }

    // Transfer NFT
    function transferNFT(address to, uint256 tokenId) external nonReentrant {
        nftContract.transferFrom(msg.sender, to, tokenId);
        emit NFTTransferred(msg.sender, to, tokenId);
    }

    // Mint NFT
    uint256 public nftMintCost = 100; // Cost in ARC tokens
    function mintNFT() external nonReentrant {
        require(arcToken.transferFrom(msg.sender, address(this), nftMintCost), "Payment failed");
        nftContract.mint(msg.sender);
        emit NFTMinted(msg.sender);
    }

    // Stake tokens
    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        stakedBalances[msg.sender] += amount;
        emit TokensStaked(msg.sender, amount);
    }

    // Unstake tokens
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        stakedBalances[msg.sender] -= amount;
        require(arcToken.transfer(msg.sender, amount), "Transfer failed");
        emit TokensUnstaked(msg.sender, amount);
    }

    // Apply to become an admin
    function applyForAdmin() external nonReentrant {
        require(!isOwner[msg.sender], "Already an owner");
        require(!pendingApplications[msg.sender], "Application already pending");
        require(stakedBalances[msg.sender] >= adminApplicationStake, "Insufficient stake");
        pendingApplications[msg.sender] = true;
        emit AdminApplicationSubmitted(msg.sender);
    }

    // Accept admin application
    function acceptAdminApplication(address applicant) external onlyOwner {
        require(pendingApplications[applicant], "No pending application");
        pendingApplications[applicant] = false;
        isOwner[applicant] = true;
        owners.push(applicant);
        ownerCount++;
        emit OwnerAdded(applicant);
        emit AdminApplicationAccepted(applicant);
    }

    // Reject admin application
    function rejectAdminApplication(address applicant) external onlyOwner {
        require(pendingApplications[applicant], "No pending application");
        pendingApplications[applicant] = false;
        emit AdminApplicationRejected(applicant);
    }

    // Deposit tokens to fund the contract
    function depositTokens(uint256 amount) external onlyOwner {
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    // Get the balance of ARC tokens held by this contract
    function getArcTokenBalance() external view returns (uint256) {
        return arcToken.balanceOf(address(this));
    }
}