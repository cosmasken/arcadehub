/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import supabase from '../hooks/use-supabase';

interface ProfileState {
  username: string;
  bio: string;
  avatar: string;
  arcBalance: number;
  gamesPlayed: number;
  achievements: any[];
  role: 'gamer' | 'developer' | 'admin' | 'sponsor';
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
    result?: string;
    prize?: string;
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
  adminStats?: {
    totalUsers: number;
    totalTournaments: number;
    systemHealth: string;
  };
  sponsorStats?: {
    totalSponsored: number;
    activeTournaments: number;
    completedTournaments: number;
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
  achievements: [],
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
  adminStats: {
    totalUsers: 0,
    totalTournaments: 0,
    systemHealth: 'Good',
  },
  sponsorStats: {
    totalSponsored: 0,
    activeTournaments: 0,
    completedTournaments: 0,
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
      // 1. Fetch basic profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedWalletAddress)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        set({ loading: false, error: profileError?.message || 'Profile not found' });
        return;
      }

      // Set role directly from user_type
      set({
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar_url,
        role: profile.user_type,
      });

      // 3. Fetch achievements based on new schema
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.id);

      set({ achievements: achievements || [] });

      // 4. Fetch user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      // 5. For different user types, fetch different data
      if (profile.user_type === 'admin') {
        // Fetch admin-specific data
        const { count: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
        
        const { count: tournamentCount } = await supabase
          .from('tournaments')
          .select('id', { count: 'exact', head: true });

        set({
          adminStats: {
            totalUsers: userCount || 0,
            totalTournaments: tournamentCount || 0,
            systemHealth: 'Good',
          },
        });
      } else if (profile.user_type === 'sponsor') {
        // Fetch sponsor-specific data
        const { data: sponsoredTournaments } = await supabase
          .from('tournaments')
          .select('*')
          .eq('sponsor_id', profile.id);

        const totalSponsored = sponsoredTournaments?.reduce((sum, t) => sum + Number(t.prize_pool || 0), 0) || 0;

        set({
          sponsorStats: {
            totalSponsored: totalSponsored,
            activeTournaments: sponsoredTournaments?.filter(t => t.status === 'active').length || 0,
            completedTournaments: sponsoredTournaments?.filter(t => t.status === 'completed').length || 0,
          },
        });
      } else {
        // Fetch player/gamer data
        const { data: tournamentParticipations } = await supabase
          .from('tournament_participants')
          .select('*')
          .eq('user_id', profile.id);

        set({ gamesPlayed: tournamentParticipations?.length || 0 });
      }

      // 6. Fetch games if user type includes developer functionality
      if (profile.user_type === 'developer') {
        const { data: developerGames } = await supabase
          .from('games')
          .select('*')
          .eq('developer_id', profile.id);

        set({ 
          developerGames: developerGames || [],
          developerStats: {
            totalGames: developerGames?.length || 0,
            totalPlays: 0, // Calculate from game stats if available
            totalRevenue: 0, // Calculate from revenue data if available
            avgRating: 0, // Calculate from ratings if available
          },
        });
      }

      // 7. Set general stats
      set({
        stats: {
          gamesPlayed: userStats?.total_tournaments || 0,
          achievements: achievements?.length || 0,
          totalScore: 0, // Calculate from actual game scores
          rank: '', // Calculate rank based on points/scores
        },
      });

      set({ loading: false });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
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
      
      const { error } = await supabase.from('users').upsert([
        {
          wallet_address: normalizedWalletAddress,
          username: userData.username,
          bio: userData.bio,
          user_type: userData.role || userData.userType || 'player',
          avatar_url: userData.avatar,
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