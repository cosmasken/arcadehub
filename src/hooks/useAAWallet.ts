/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import useAuthStore from '@/hooks/use-auth';
import { getArcadeHubContract, getARCTokenContract } from '@/lib/contractUtils';
import { CONTRACT_ADDRESSES, NERO_CHAIN_CONFIG } from '@/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

export const useAAWallet = () => {
  const { aaSigner, aaWallet, initAAWallet } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [balance, setBalance] = useState('0');
  const [txStatus, setTxStatus] = useState<{
    loading: boolean;
    error: string | null;
    hash: string | null;
  }>({ loading: false, error: null, hash: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Type assertion to ensure aaSigner is properly typed
  const typedAAWallet = aaWallet as string | undefined;

  // Auto-initialize AA wallet
  useEffect(() => {
    const initialize = async () => {
      if (aaSigner && !aaWallet) {
        setIsInitializing(true);
        try {
          await initAAWallet();
          await refreshBalance();
        } finally {
          setIsInitializing(false);
        }
      }
    };
    initialize();
  }, [aaSigner, aaWallet]);

  // Refresh ARC token balance
  const refreshBalance = async () => {
    if (!aaSigner || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const contract = getARCTokenContract(aaSigner);
      const walletAddress = await aaSigner.getAddress();
      const balance = await contract.balanceOf(walletAddress);
      // Format balance with commas and limit to 2 decimal places
      const formattedBalance = ethers.formatEther(balance);
      setBalance(formattedBalance.replace(/\.\d+$/, function(x) {
        return x.match(/\d{1,2}$/)![0];
      }).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    } catch (error) {
      console.error("Balance refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Claim developer payouts
  const claimPayout = async () => {
    if (!aaSigner || !aaWallet) {
      setTxStatus({ loading: false, error: "Wallet not connected", hash: null });
      return false;
    }

    setTxStatus({ loading: true, error: null, hash: null });
    
    try {
      const contract = getArcadeHubContract(aaSigner);
      const tx = await contract.claimPayout();
      setTxStatus({ loading: true, error: null, hash: tx.hash });
      
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxStatus({ loading: false, error: null, hash: tx.hash });
        // Refresh balance after a small delay to prevent race conditions
        setTimeout(() => {
          refreshBalance();
        }, 1000);
        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Claim failed:", error);
      setTxStatus({
        loading: false,
        error: error.reason || error.message || "Unknown error",
        hash: null
      });
      return false;
    }
  };

  return {
    aaWallet: typedAAWallet,
    aaSigner,
    balance,
    isInitializing,
    txStatus,
    initAAWallet,
    refreshBalance,
    isLoading: isInitializing || txStatus.loading || isRefreshing,
    claimPayout,
  };
};