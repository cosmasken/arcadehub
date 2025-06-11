// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeveloperPayouts is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    mapping(address => uint256) public developerBalances;

    event DeveloperRevenueAllocated(address indexed developer, uint256 amount);
    event TokensDeposited(address indexed owner, uint256 amount);
    event DeveloperPayoutClaimed(address indexed developer, uint256 amount);

    constructor(address _arcToken, address _initialOwner) Ownable(_initialOwner) {
        require(_arcToken != address(0), "Invalid token address");
        arcToken = IERC20(_arcToken);
    }

    function depositTokens(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit TokensDeposited(msg.sender, amount);
    }

    function allocateDeveloperRevenue(address developer, uint256 amount) external onlyOwner {
        require(developer != address(0), "Invalid developer address");
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        developerBalances[developer] += amount;
        emit DeveloperRevenueAllocated(developer, amount);
    }

    function claimDeveloperPayout() external nonReentrant {
        uint256 amount = developerBalances[msg.sender];
        require(amount > 0, "No payout available");
        developerBalances[msg.sender] = 0;
        require(arcToken.transfer(msg.sender, amount), "Transfer failed");
        emit DeveloperPayoutClaimed(msg.sender, amount);
    }

    function getTokenBalance() external view returns (uint256) {
        return arcToken.balanceOf(address(this));
    }
}