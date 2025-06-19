
import React from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { ethers } from "ethers";
import TournamentHubABI from "../abi/TournamentHub.json";

import { TESTNET_CONFIG } from "../config";
import { getProvider } from "../lib/aaUtils";

const POLL_INTERVAL = 10000; // 10 seconds

const Leaderboard = () => {
  const leaderboardData = [
    {
      rank: 1,
      player: "CRYPTO_KING",
      score: 2847592,
      games: 156,
      winRate: 87,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
    },
    {
      rank: 2,
      player: "NEON_WARRIOR",
      score: 2234156,
      games: 143,
      winRate: 84,
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop&crop=face"
    },
    {
      rank: 3,
      player: "PIXEL_MASTER",
      score: 1876543,
      games: 128,
      winRate: 79,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    },
    {
      rank: 4,
      player: "RETRO_GAMER",
      score: 1654321,
      games: 112,
      winRate: 76,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      rank: 5,
      player: "ARCADE_LEGEND",
      score: 1432876,
      games: 98,
      winRate: 73,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-cyan-400 font-mono text-lg">#{rank}</span>;
    }
  };

  return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400">
                &gt; LEADERBOARD &lt;
              </h1>
              <p className="text-green-400 text-lg tracking-wider">
                TOP PLAYERS IN THE ARCADE
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="text-sm text-green-400">TOTAL PLAYERS</p>
                    <p className="text-2xl font-bold text-cyan-400">15,847</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="flex items-center space-x-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-green-400">TOTAL PRIZES</p>
                    <p className="text-2xl font-bold text-cyan-400">2,847 NERO</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm text-green-400">AVG WIN RATE</p>
                    <p className="text-2xl font-bold text-cyan-400">68%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Leaderboard Table */}
            <Card className="bg-black border-cyan-400 border-2 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">&gt; TOP PLAYERS</h2>
                <Button className="bg-green-400 text-black hover:bg-green-300 font-mono">
                  <Target className="w-4 h-4 mr-2" />
                  VIEW ALL
                </Button>
              </div>
              
              <div className="space-y-4">
                {leaderboardData.map((player) => (
                  <div key={player.rank} className="flex items-center p-4 border border-green-400 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        {getRankIcon(player.rank)}
                        <img 
                          src={player.avatar} 
                          alt={player.player}
                          className="w-12 h-12 rounded border-2 border-cyan-400"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-lg font-bold text-cyan-400">{player.player}</p>
                        <p className="text-green-400">RANK #{player.rank}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-400">{player.score.toLocaleString()}</p>
                        <p className="text-sm text-green-400">POINTS</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg text-cyan-400">{player.games}</p>
                        <p className="text-sm text-green-400">GAMES</p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${player.winRate >= 80 ? 'bg-green-400 text-black' : 'bg-yellow-400 text-black'}`}>
                          {player.winRate}% WIN
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Leaderboard;
