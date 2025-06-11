// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdminApplications is Ownable, ReentrancyGuard {
    IERC20 public immutable arcToken;
    uint256 public adminApplicationStake = 1000; // Minimum stake in ARC tokens
    mapping(address => uint256) public stakedBalances; // User stakes
    mapping(address => bool) public pendingApplications;
    address[] public admins; // List of approved admins
    mapping(address => bool) public isAdmin; // Admin status

    event AdminApplicationSubmitted(address indexed applicant);
    event AdminApplicationAccepted(address indexed applicant);
    event AdminApplicationRejected(address indexed applicant);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor(address _arcToken, address _initialOwner) Ownable(_initialOwner) {
        require(_arcToken != address(0), "Invalid token address");
        arcToken = IERC20(_arcToken);
        isAdmin[_initialOwner] = true;
        admins.push(_initialOwner);
    }

    function setAdminApplicationStake(uint256 _newStake) external onlyOwner {
        require(_newStake > 0, "Stake must be greater than zero");
        adminApplicationStake = _newStake;
    }

    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(arcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        stakedBalances[msg.sender] += amount;
        emit TokensStaked(msg.sender, amount);
    }

    function unstakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        require(!pendingApplications[msg.sender], "Cannot unstake with pending application");
        stakedBalances[msg.sender] -= amount;
        require(arcToken.transfer(msg.sender, amount), "Transfer failed");
        emit TokensUnstaked(msg.sender, amount);
    }

    function applyForAdmin() external nonReentrant {
        require(!isAdmin[msg.sender], "Already an admin");
        require(!pendingApplications[msg.sender], "Application already pending");
        require(stakedBalances[msg.sender] >= adminApplicationStake, "Insufficient stake");
        pendingApplications[msg.sender] = true;
        emit AdminApplicationSubmitted(msg.sender);
    }

    function acceptAdminApplication(address applicant) external onlyOwner {
        require(pendingApplications[applicant], "No pending application");
        pendingApplications[applicant] = false;
        isAdmin[applicant] = true;
        admins.push(applicant);
        emit AdminAdded(applicant);
        emit AdminApplicationAccepted(applicant);
    }

    function rejectAdminApplication(address applicant) external onlyOwner {
        require(pendingApplications[applicant], "No pending application");
        pendingApplications[applicant] = false;
        emit AdminApplicationRejected(applicant);
    }

    function removeAdmin(address adminToRemove) external onlyOwner {
        require(isAdmin[adminToRemove], "Not an admin");
        require(adminToRemove != owner(), "Cannot remove contract owner");
        isAdmin[adminToRemove] = false;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i] == adminToRemove) {
                admins[i] = admins[admins.length - 1];
                admins.pop();
                break;
            }
        }
        emit AdminRemoved(adminToRemove);
    }

    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    function getTokenBalance() external view returns (uint256) {
        return arcToken.balanceOf(address(this));
    }
}