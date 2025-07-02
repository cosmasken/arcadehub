/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import supabase from '../hooks/use-supabase';

interface ProfileState {
  username: string;
  bio: string;
  avatar: string;
  arcBalance: number;
  gamesPlayed: number;
  achievements: number;
  role: 'gamer' | 'developer' | 'admin';
  assets: {
    id: string;
    name: string;
    image: string;
    rarity?: string;
    value?: number;
  }[];
  history: {
    id: string;
    game: string;
    score: number;
    date: string;
    duration?: string;
  }[];
  developerGames: {
    id: string;
    title: string;
    plays: number;
    revenue: number;
    image?: string;
    status?: string;
    game_id?: string;
  }[];
  friends: {
    id: string;
    username: string;
    avatar: string;
    online: boolean;
  }[];
  stats: {
    gamesPlayed: number;
    achievements: number;
    totalScore: number;
    rank: string;
  };
  developerStats: {
    totalGames: number;
    totalPlays: number;
    totalRevenue: number;
    avgRating: number;
  };
  loading: boolean;
  error: string | null;
  fetchProfile: (walletAddress: string) => Promise<void>;
  setUsername: (username: string) => void;
  setBio: (bio: string) => void;
  setAvatar: (avatar: string) => void;
  checkUsernameExists: (username: string) => Promise<boolean>;
  onboardUser: (walletAddress: string, userData: any) => Promise<boolean>;
}

const useProfileStore = create<ProfileState>((set, get) => ({
  username: '',
  bio: '',
  avatar: '',
  arcBalance: 0,
  gamesPlayed: 0,
  achievements: 0,
  assets: [],
  history: [],
  developerGames: [],
  friends: [],
  role: 'gamer',
  stats: {
    gamesPlayed: 0,
    achievements: 0,
    totalScore: 0,
    rank: '',
  },
  developerStats: {
    totalGames: 0,
    totalPlays: 0,
    totalRevenue: 0,
    avgRating: 0,
  },
  loading: false,
  error: null,

  setUsername: (username: string) => set({ username }),
  setBio: (bio: string) => set({ bio }),
  setAvatar: (avatar: string) => set({ avatar }),

  fetchProfile: async (walletAddress: string) => {
    set({ loading: true, error: null });
    try {
      // Ensure wallet address is in lowercase for consistent database queries
      const normalizedWalletAddress = walletAddress.toLowerCase();
      
      // 1. Fetch profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedWalletAddress)
        .single();

      if (profileError || !profile) {
        set({ loading: false, error: profileError?.message || 'Profile not found' });
        return;
      }

      set({
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar,
        role: profile.role,
      });

      // 2. Fetch achievements (gamer)
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_wallet', normalizedWalletAddress);

      set({ achievements: achievements?.length || 0 });

      // 3. Fetch games played count (gamer)
      const { count: gamesPlayed } = await supabase
        .from('game_plays')
        .select('*', { count: 'exact', head: true })
        .eq('player_wallet', normalizedWalletAddress);

      set({ gamesPlayed: gamesPlayed || 0 });

      // 4. Fetch developer games (developer)
      const { data: developerGames } = await supabase
        .from('games')
        .select('*')
        .eq('developer', normalizedWalletAddress);

      set({ developerGames: developerGames || [] });

      // 5. Fetch developer stats (developer)
      const gameIds = (developerGames || []).map((g: any) => g.game_id);
      let devStats = [];
      if (gameIds.length > 0) {
        const { data } = await supabase
          .from('game_stats')
          .select('*')
          .in('game_id', gameIds);
        devStats = data || [];
      }
      const totalRevenue = 0;
      let totalPlays = 0, avgRating = 0 ;
      if (devStats.length > 0) {
        totalPlays = devStats.reduce((sum, s) => sum + (s.total_plays || 0), 0);
        avgRating = devStats.reduce((sum, s) => sum + (s.avg_rating || 0), 0) / devStats.length;
        // If you have revenue data, sum it here
        // totalRevenue = devStats.reduce((sum, s) => sum + (s.revenue || 0), 0);
      }

      set({
        developerStats: {
          totalGames: developerGames?.length || 0,
          totalPlays,
          totalRevenue,
          avgRating: isNaN(avgRating) ? 0 : avgRating,
        },
      });

      // 6. Fetch assets (if you have an assets table)
      // const { data: assets } = await supabase.from('assets').select('*').eq('owner', walletAddress);
      // set({ assets: assets || [] });

      // 7. Fetch history (if you have a history table)
      // const { data: history } = await supabase.from('history').select('*').eq('user_wallet', walletAddress);
      // set({ history: history || [] });

      // 8. Fetch friends (if you have a friends table)
      // const { data: friends } = await supabase.from('friends').select('*').eq('user_wallet', walletAddress);
      // set({ friends: friends || [] });

      // 9. Set stats (gamer)
      set({
        stats: {
          gamesPlayed: gamesPlayed || 0,
          achievements: achievements?.length || 0,
          totalScore: 0, // Replace with real calculation if you have score data
          rank: '',      // Replace with real calculation if you have rank data
        },
      });

      set({ loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  checkUsernameExists: async (username: string) => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    return !!data;
  },

  onboardUser: async (walletAddress: string, userData: any) => {
    set({ loading: true, error: null });
    try {
      // Ensure wallet address is in lowercase to match database constraint
      const normalizedWalletAddress = walletAddress.toLowerCase();
      
      // Create a new object without wallet_address if it exists in userData
      // const { wallet_address, ...restUserData } = userData;
      
      const { error } = await supabase.from('users').upsert([
        {
          wallet_address: normalizedWalletAddress,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'wallet_address',
        defaultToNull: false
      });
      
      if (error) {
        console.error('Error in onboardUser:', error);
        set({ loading: false, error: error.message });
        return false;
      }
      
      // Fetch profile using the normalized wallet address
      await get().fetchProfile(normalizedWalletAddress);
      set({ loading: false });
      return true;
    } catch (err: any) {
      console.error('Exception in onboardUser:', err);
      set({ loading: false, error: err.message });
      return false;
    }
  },
}));

export default useProfileStore;