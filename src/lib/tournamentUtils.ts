import { ethers } from 'ethers';
import TournamentHubAbi from '../abi/TournamentHub.json';
import { TESTNET_CONFIG } from '../config';
import { getProvider } from './aaUtils';

/**
 * Retrieve active tournament Id for given name (case-insensitive).
 * Returns undefined if not found.
 */
export async function getActiveTournamentIdByName(name: string): Promise<number | undefined> {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(
      TESTNET_CONFIG.smartContracts.tournamentHub,
      TournamentHubAbi,
      provider
    );
    const activeIds: number[] = await contract.getActiveTournamentIds();
    for (const id of activeIds) {
      const info = await contract.getTournamentInfo(id, ethers.ZeroAddress);
      if (info.name.toLowerCase() === name.toLowerCase()) {
        return id;
      }
    }
  } catch (err) {
    console.warn('getActiveTournamentIdByName error', err);
  }
  return undefined;
}
