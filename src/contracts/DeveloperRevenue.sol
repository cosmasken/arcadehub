pragma solidity ^0.8.20;

contract DeveloperRevenue {
    mapping(address => uint256) public developerBalances;

    event DeveloperRevenueAllocated(address indexed developer, uint256 amount);
    event DeveloperPayoutClaimed(address indexed developer, uint256 amount);

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
}