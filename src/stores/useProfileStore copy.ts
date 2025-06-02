import {create} from 'zustand';
import supabase from '../hooks/use-supabase';


interface ProfileState {
  username: string;
  bio: string;
  avatar: string;
  arcBalance: number;
  gamesPlayed: number;
  achievements: number;
  role: 'gamer' | 'developer' | 'admin'; // Optional, can be used to differentiate roles
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
  }[];
  friends: {
    id: string;
    username: string;
    avatar: string;
    online: boolean;
  }[];
  // Computed fields
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




const useProfileStore = create<ProfileState>((set,get) => ({
 username:'',
  bio: '',
  avatar: 'user.avatar',
  arcBalance: 0,
  gamesPlayed: 0,
  achievements: 0,
  null:[],
  assets: [],
  history: [],
  developerGames: [],
  friends: [],
  role: 'gamer', // Default role, can be changed later
  loading: false,
  error: null,
  get stats() {
    return {
      gamesPlayed: get().gamesPlayed,
      achievements: get().achievements,
      totalScore: 12345, // Replace with real calculation if needed
      rank: "Gold",      // Replace with real calculation if needed
    };
  },
   get developerStats() {
    const games = get().developerGames;
    const totalGames = games.length;
    const totalPlays = games.reduce((sum, g) => sum + (g.plays || 0), 0);
    const totalRevenue = games.reduce((sum, g) => sum + (g.revenue || 0), 0);
    const avgRating = 4.8; // Placeholder, replace with real calculation if available
    return {
      totalGames,
      totalPlays,
      totalRevenue,
      avgRating,
    };
  },
  setUsername: (username: string) => set({ username }),
  setBio: (bio: string) => set({ bio }),
  setAvatar: (avatar: string) => set({ avatar }),
  setArcBalance: (arcBalance: number) => set({ arcBalance }),
  setGamesPlayed: (gamesPlayed: number) => set({ gamesPlayed }),
  setAchievements: (achievements: number) => set({ achievements }),
  setAssets: (assets: ProfileState['assets']) => set({ assets }),
  setHistory: (history: ProfileState['history']) => set({ history }),
  setDeveloperGames: (developerGames: ProfileState['developerGames']) => set({ developerGames }),
  fetchProfile: async (walletAddress: string) => {
  set({ loading: true, error: null });
  try {
    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError || !profile) {
      set({ loading: false, error: profileError?.message || 'Profile not found' });
      return;
    }

    set({
      username: profile.username,
      bio: profile.bio,
      role: profile.role,
    });

    // 2. Fetch achievements (gamer)
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_wallet', walletAddress);

    set({ achievements: achievements?.length || 0 });

    // 3. Fetch games played count (gamer)
    const { count: gamesPlayed } = await supabase
      .from('game_plays')
      .select('*', { count: 'exact', head: true })
      .eq('player_wallet', walletAddress);

    set({ gamesPlayed: gamesPlayed || 0 });

    // 4. Fetch developer games (developer)
    const { data: developerGames } = await supabase
      .from('games')
      .select('*')
      .eq('developer', walletAddress);

    set({ developerGames: developerGames || [] });

    // 5. Fetch developer stats (developer)
    // Example: aggregate stats from game_stats view
    const { data: devStats } = await supabase
      .from('game_stats')
      .select('*')
      .in('game_id', (developerGames || []).map((g: any) => g.game_id));

    // Calculate stats
    let totalPlays = 0, avgRating = 0;
    const totalRevenue = 0;
    if (devStats && devStats.length > 0) {
      totalPlays = devStats.reduce((sum, s) => sum + (s.total_plays || 0), 0);
      avgRating = devStats.reduce((sum, s) => sum + (s.avg_rating || 0), 0) / devStats.length;
      // You can fetch revenue from another table if you track it
    }
    set({
      developerStats: {
        totalGames: developerGames?.length || 0,
        totalPlays,
        totalRevenue, // update if you have revenue data
        avgRating: isNaN(avgRating) ? 0 : avgRating,
      }
    });

    set({ loading: false });
  } catch (error: any) {
    set({ loading: false, error: error.message });
  }
},
checkUsernameExists: async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return !!data;
},

onboardUser: async (walletAddress: string, userData: any) => {
  set({ loading: true, error: null });
  try {
    const { error } = await supabase.from('profiles').upsert([
      {
        wallet_address: walletAddress,
        ...userData,
      },
    ]);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    await get().fetchProfile(walletAddress);
    set({ loading: false });
    return true;
  } catch (err: any) {
    set({ loading: false, error: err.message });
    return false;
  }
},
}));

export default useProfileStore;
