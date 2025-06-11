pragma solidity ^0.8.20;

contract AdminApplication {
    uint256 public adminApplicationStake = 1000;
    mapping(address => bool) public pendingApplications;

    event AdminApplicationSubmitted(address indexed applicant);
    event AdminApplicationAccepted(address indexed applicant);
    event AdminApplicationRejected(address indexed applicant);

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
}