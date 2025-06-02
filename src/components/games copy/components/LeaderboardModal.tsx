
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export const LeaderboardModal = ({ open, onClose }: LeaderboardModalProps) => {
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "BeeKeeper2023", score: 1250000, emoji: "🥇" },
    { rank: 2, name: "HoneyMaster", score: 890000, emoji: "🥈" },
    { rank: 3, name: "SweetClicker", score: 650000, emoji: "🥉" },
    { rank: 4, name: "BeeWhisperer", score: 450000, emoji: "🏅" },
    { rank: 5, name: "HiveManager", score: 320000, emoji: "🏅" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🏆 Leaderboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {leaderboard.map((player) => (
            <Card key={player.rank} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{player.emoji}</span>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">Rank #{player.rank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">🍯 {player.score.toLocaleString()}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="font-semibold text-blue-800">Your Best Score</div>
            <div className="text-blue-600">🍯 Coming Soon!</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
