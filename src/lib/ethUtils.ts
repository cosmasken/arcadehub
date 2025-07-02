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

// Minimal ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

/**
 * Fetches balances for all ERC20 tokens for a user.
 * @param provider ethers.js provider
 * @param userAddress user's wallet address
 * @param tokenMap object of {symbol: address}
 * @returns Promise<{ [symbol: string]: { balance: string, address: string, decimals: number } }>
 */
export async function getAllERC20Balances(provider, userAddress, tokenMap) {
  const balances = {};
  for (const [symbol, address] of Object.entries(tokenMap)) {
    try {
      const contract = new ethers.Contract(address as string, ERC20_ABI, provider);
      const [rawBalance, decimals] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals()
      ]);
      balances[symbol] = {
        balance: ethers.formatUnits(rawBalance, decimals),
        address,
        decimals
      };
    } catch (err) {
      console.error(`Error fetching balance for ${symbol}:`, err);
      balances[symbol] = { balance: '0', address, decimals: 18 };
    }
  }
  return balances;
}

export { checkTournamentParticipation };