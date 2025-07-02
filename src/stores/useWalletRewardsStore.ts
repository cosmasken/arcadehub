import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { WalletSummary, WalletBalance, PendingReward, WalletTransaction } from '../types/supabase';
import useWalletStore from './useWalletStore';
import { getAllERC20Balances } from '../lib/ethUtils';
import { CONFIG } from '../config';

export interface ERC20Balance {
  balance: string;
  address: string;
  decimals: number;
}

interface WalletRewardsStore {
  // State
  isLoading: boolean;
  error: string | null;
  walletSummary: WalletSummary | null;
  
  // Actions
  fetchWalletSummary: () => Promise<void>;
  getWalletBalance: (userId?: string) => Promise<WalletBalance | null>;
  getPendingRewards: (userId?: string) => Promise<PendingReward[]>;
  getTransactionHistory: (limit?: number, userId?: string) => Promise<WalletTransaction[]>;
  claimReward: (rewardId: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  fetchAndSyncERC20Balances: (provider: unknown, userAddress: string) => Promise<Record<string, ERC20Balance> | null>;
}

export const useWalletRewardsStore = create<WalletRewardsStore>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  walletSummary: null,

  // Fetch wallet summary including balance, pending rewards, and recent transactions
  fetchWalletSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      // First check if user is authenticated with Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('User not authenticated with Supabase, checking Web3Auth...');
        const walletStore = useWalletStore.getState();
        if (!walletStore.isConnected || !walletStore.aaWalletAddress) {
          throw new Error('Please connect your wallet first');
        }
        
        // If we have a wallet connection but no Supabase session,
        // we'll continue with the wallet address as the user ID
        const walletAddress = walletStore.aaWalletAddress;
        
        // Fetch data using wallet address instead of user ID
        const [balance, rewards, transactions] = await Promise.all([
          get().getWalletBalance(walletAddress),
          get().getPendingRewards(walletAddress),
          get().getTransactionHistory(10, walletAddress)
        ]);
        
        set({
          walletSummary: {
            balance: balance || {
              user_id: walletAddress,
              total_balance: '0',
              available_balance: '0',
              locked_balance: '0',
              updated_at: new Date().toISOString()
            },
            pending_rewards: rewards,
            recent_transactions: transactions
          },
          isLoading: false
        });
        return;
      }
      
      // If user is authenticated with Supabase, fetch data normally
      const [balance, rewards, transactions] = await Promise.all([
        get().getWalletBalance(user.id),
        get().getPendingRewards(user.id),
        get().getTransactionHistory(10, user.id)
      ]);
      
      set({
        walletSummary: {
          balance: balance || {
            user_id: user.id,
            total_balance: '0',
            available_balance: '0',
            locked_balance: '0',
            updated_at: new Date().toISOString()
          },
          pending_rewards: rewards,
          recent_transactions: transactions
        },
        isLoading: false
      });

      set({
        walletSummary: {
          balance: balance || {
            user_id: user.id,
            total_balance: '0',
            available_balance: '0',
            locked_balance: '0',
            updated_at: new Date().toISOString()
          },
          pending_rewards: rewards,
          recent_transactions: transactions
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch wallet data',
        isLoading: false
      });
    }
  },

  // Get wallet balance
  getWalletBalance: async (userId?: string): Promise<WalletBalance | null> => {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return null;
    }
  },

  // Get pending rewards
  getPendingRewards: async (userId?: string): Promise<PendingReward[]> => {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('pending_rewards')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
      return [];
    }
  },

  // Get transaction history
  getTransactionHistory: async (limit = 10, userId?: string): Promise<WalletTransaction[]> => {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  },

  // Claim a pending reward
  claimReward: async (rewardId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Start a transaction
      const { data: reward, error: rewardError } = await supabase.rpc('claim_reward', {
        p_reward_id: rewardId,
        p_user_id: user.id
      });

      if (rewardError) throw rewardError;

      // Refresh the wallet data
      await get().fetchWalletSummary();
      
      return { success: true };
    } catch (error) {
      console.error('Error claiming reward:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim reward';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch all ERC20 token balances for a user and update Supabase
  fetchAndSyncERC20Balances: async (provider: unknown, userAddress: string) => {
    try {
      const balances = await getAllERC20Balances(provider, userAddress, CONFIG.erc20);
      for (const symbol of Object.keys(balances)) {
        const { balance, address, decimals } = balances[symbol] as ERC20Balance;
        await supabase.from('wallet_balances').upsert({
          user_id: userAddress,
          token_symbol: symbol,
          token_address: address,
          balance,
          decimals
        }, { onConflict: 'user_id,token_address' });
      }
      return balances;
    } catch (err) {
      console.error('Error syncing ERC20 balances:', err);
      return null;
    }
  },

  // Refresh all wallet data
  refreshData: async () => {
    await get().fetchWalletSummary();
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  }
}));

export default useWalletRewardsStore;
