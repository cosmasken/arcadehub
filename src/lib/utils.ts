/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(aaWalletAddress: string) {
    return `${aaWalletAddress.slice(0, 6)}...${aaWalletAddress.slice(-4)}`;
};

export const decodeError = (error: any): string => {
  const errorMessages = {
    InvalidTokenAddress: "Selected token is not allowed.",
    NEROTransferFailed: "Failed to transfer NERO.",
    TokenTransferFailed: "Failed to transfer tokens.",
    NotCreator: "Only the tournament creator can perform this action.",
    NotDemoMode: "This action is only available in demo mode.",
    InactiveTournament: "The tournament is not active.",
    TournamentEnded: "The tournament has already ended.",
    DisputePeriodActive: "Dispute period is still active.",
    AlreadyDistributed: "Prizes have already been distributed."
  };
  const reason = error.reason || error.message || 'Unknown error';
  for (const [key, value] of Object.entries(errorMessages)) {
    if (reason.includes(key)) return value;
  }
  return reason;
};