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
  }[];
  history: {
    game: string;
    score: string;
    date: string;
  }[];
  developerGames: {
    id: string;
    title: string;
    plays: number;
    revenue: number;
  }[];
}

const user = {
  username: "GamerX",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=GamerX",
  bio: "Passionate arcade gamer and developer. I love puzzle games and racing games.",
  arcBalance: 0,
  gamesPlayed: 45,
  achievements: 12,
  assets: [
    { id: "nft1", name: "Star Trophy", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
    { id: "nft2", name: "Race Car", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
  ],
  history: [
    { game: "Star Blaster", score: "1028", date: "2025-05-18" },
    { game: "Puzzle Pop", score: "325", date: "2025-05-17" },
    { game: "Turbo Dash", score: "582", date: "2025-05-15" },
  ],
  developerGames: [
    { id: "game1", title: "Space Adventure", plays: 235, revenue: 50 },
  ],
};


const useProfileStore = create<ProfileState>((set) => ({
  username: user.username,
  bio: user.bio,
  avatar: user.avatar,
  arcBalance: user.arcBalance,
  gamesPlayed: user.gamesPlayed,
  achievements: user.achievements,
  assets: user.assets,
  history: user.history,
  developerGames: user.developerGames,
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
