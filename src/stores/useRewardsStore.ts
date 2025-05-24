import { create } from "zustand";

export interface RewardHistoryRecord {
  id: number;
  date: string;
  game: string;
  type: "Earn" | "Spend" | "Referral";
  amount: number;
}

export interface Referral {
  name: string;
  joined: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  progress: number;
  goal: number;
  unit: string;
}

export interface RewardsState {
  totalEarned: number;
  totalSpent: number;
  referrals: Referral[];
  achievements: Achievement[];
  rewardsHistory: RewardHistoryRecord[];
  addReward: (record: RewardHistoryRecord) => void;
  addReferral: (referral: Referral) => void;
  updateAchievement: (id: number, progress: number) => void;
  setTotals: (earned: number, spent: number) => void;
  
}

export const useRewardsStore = create<RewardsState>((set) => ({
  totalEarned: 500,
  totalSpent: 100,
  referrals: [
    { name: "Alex", joined: "May 15, 2025" },
    { name: "Maya", joined: "May 12, 2025" },
    { name: "Leo", joined: "May 10, 2025" },
  ],
  achievements: [
    { id: 1, name: "Game Master", description: "Play 50 games", progress: 35, goal: 50, unit: "games" },
    { id: 2, name: "Big Earner", description: "Earn 1000 ARC", progress: 500, goal: 1000, unit: "ARC" },
  ],
  rewardsHistory: [
    { id: 1, date: "2025-05-18", game: "Star Blaster", type: "Earn", amount: 50 },
    { id: 2, date: "2025-05-17", game: "Puzzle Pop", type: "Earn", amount: 30 },
    { id: 3, date: "2025-05-16", game: "Clicker Craze", type: "Earn", amount: 40 },
    { id: 4, date: "2025-05-15", game: "-", type: "Referral", amount: 25 },
    { id: 5, date: "2025-05-14", game: "Star Blaster", type: "Spend", amount: -20 },
  ],
  addReward: (record) =>
    set((state) => ({
      rewardsHistory: [record, ...state.rewardsHistory],
      totalEarned: record.amount > 0 ? state.totalEarned + record.amount : state.totalEarned,
      totalSpent: record.amount < 0 ? state.totalSpent + Math.abs(record.amount) : state.totalSpent,
    })),
  addReferral: (referral) =>
    set((state) => ({
      referrals: [referral, ...state.referrals],
    })),
  updateAchievement: (id, progress) =>
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === id ? { ...a, progress } : a
      ),
    })),
  setTotals: (earned, spent) =>
    set(() => ({
      totalEarned: earned,
      totalSpent: spent,
    })),
}));