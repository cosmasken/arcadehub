
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  tokens: number;
}

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  open,
  onOpenChange
}) => {
  // Mock leaderboard data - in real app this would come from backend
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "BeeKeeper Pro", score: 50000, tokens: 5000 },
    { rank: 2, name: "Honey Master", score: 45000, tokens: 4500 },
    { rank: 3, name: "Sweet Clicker", score: 40000, tokens: 4000 },
    { rank: 4, name: "Buzz Champion", score: 35000, tokens: 3500 },
    { rank: 5, name: "You", score: 30000, tokens: 3000 },
  ];

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🏆 Leaderboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
          {leaderboard.map((entry) => (
            <Card key={entry.rank} className={`p-4 ${entry.name === 'You' ? 'bg-amber-50 border-amber-300' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getRankEmoji(entry.rank)}</div>
                  <div>
                    <div className="font-semibold text-amber-800 flex items-center gap-2">
                      #{entry.rank} {entry.name}
                      {entry.name === 'You' && <Badge className="bg-blue-500 text-white text-xs">You</Badge>}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-amber-800">🍯 {entry.score.toLocaleString()}</div>
                  <div className="text-sm text-amber-600">🪙 {entry.tokens.toLocaleString()} tokens</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
