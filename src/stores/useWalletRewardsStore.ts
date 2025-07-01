import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { WalletSummary, WalletBalance, PendingReward, WalletTransaction } from '../types/supabase';
import useUserStore from './useUserStore';

interface WalletRewardsStore {
  // State
  isLoading: boolean;
  error: string | null;
  walletSummary: WalletSummary | null;
  
  // Actions
  fetchWalletSummary: () => Promise<void>;
  getWalletBalance: () => Promise<WalletBalance | null>;
  getPendingRewards: () => Promise<PendingReward[]>;
  getTransactionHistory: (limit?: number) => Promise<WalletTransaction[]>;
  claimReward: (rewardId: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  clearError: () => void;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch all data in parallel
      const [balance, rewards, transactions] = await Promise.all([
        get().getWalletBalance(),
        get().getPendingRewards(),
        get().getTransactionHistory(10)
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
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch wallet data',
        isLoading: false
      });
    }
  },

  // Get wallet balance
  getWalletBalance: async (): Promise<WalletBalance | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_wallet_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return null;
    }
  },

  // Get pending rewards
  getPendingRewards: async (): Promise<PendingReward[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pending_rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .order('unlock_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
      return [];
    }
  },

  // Get transaction history
  getTransactionHistory: async (limit = 10): Promise<WalletTransaction[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
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
