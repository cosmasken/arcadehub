import {create} from 'zustand';

interface ProfileState {
  username: string;
  bio: string;
  avatar: string;
  arcBalance: number;
  gamesPlayed: number;
  achievements: number;
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
}

const user = {
  username: "GamerX",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=GamerX",
  bio: "Passionate arcade gamer and developer. I love puzzle games and racing games.",
  arcBalance: 1234.45,
  gamesPlayed: 45,
  achievements: 12,
assets: [
    { id: "nft1", name: "Star Trophy", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800", rarity: "legendary", value: 100 },
    { id: "nft2", name: "Race Car", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800", rarity: "rare", value: 50 },
  ],
  history: [
    { id: "1", game: "Star Blaster", score: 1028, date: "2025-05-18", duration: "10m" },
    { id: "2", game: "Puzzle Pop", score: 325, date: "2025-05-17", duration: "5m" },
    { id: "3", game: "Turbo Dash", score: 582, date: "2025-05-15", duration: "8m" },
  ],
  developerGames: [
    { id: "game1", title: "Space Adventure", plays: 235, revenue: 50, image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800", status: "published" },
    { id: "game2", title: "Puzzle Pop", plays: 120, revenue: 30, image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800", status: "draft" },
  ],
  friends: [
    { id: "f1", username: "PlayerOne", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=PlayerOne", online: true },
    { id: "f2", username: "ArcQueen", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ArcQueen", online: false },
  ],
};


const useProfileStore = create<ProfileState>((set,get) => ({
 username: user.username,
  bio: user.bio,
  avatar: user.avatar,
  arcBalance: user.arcBalance,
  gamesPlayed: user.gamesPlayed,
  achievements: user.achievements,
  assets: user.assets,
  history: user.history,
  developerGames: user.developerGames,
  friends: user.friends,
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
}));

export default useProfileStore;
