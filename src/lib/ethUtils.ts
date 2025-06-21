import { ethers } from "ethers";

// Function to check if an address is a participant in a tournament
async function checkTournamentParticipation(
  provider,
  tournamentAddress,
  tournamentId,
  userAddress
) {
  try {
    // Validate inputs
    if (!ethers.isAddress(tournamentAddress)) {
      throw new Error("Invalid contract address");
    }
    if (!ethers.isAddress(userAddress)) {
      throw new Error("Invalid user address");
    }
    if (!Number.isInteger(Number(tournamentId)) || Number(tournamentId) < 0) {
      throw new Error("Invalid tournament ID");
    }

    // ABI for the getTournamentInfo function
    const abi = [
      "function getTournamentInfo(uint256 tournamentId, address user) view returns (tuple(uint256 id, address creator, string name, uint256 prizePool, uint256 startTime, uint256 endTime, address[] participants, bool isActive, bool prizesDistributed, uint256 participantScore, bool isParticipant))"
    ];

    // Initialize contract instance
    const contract = new ethers.Contract(tournamentAddress, abi, provider);

    // Call getTournamentInfo to fetch participation status
    const tournamentInfo = await contract.getTournamentInfo(tournamentId, userAddress);

    // Return the isParticipant boolean
    return tournamentInfo.isParticipant;
  } catch (error) {
    console.error("Error checking tournament participation:", error.message);
    throw error;
  }
}

export { checkTournamentParticipation };