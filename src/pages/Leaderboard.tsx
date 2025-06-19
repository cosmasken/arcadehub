import React, { useEffect, useState, useRef } from "react";
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
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const getRankIcon = (rank: number) => {
      switch (rank) {
        case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
        case 2: return <Medal className="w-6 h-6 text-gray-400" />;
        case 3: return <Medal className="w-6 h-6 text-amber-600" />;
        default: return <span className="w-6 h-6 flex items-center justify-center text-cyan-400 font-mono text-lg">#{rank}</span>;
      }
    };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        TESTNET_CONFIG.smartContracts.tournamentHub,
        TournamentHubABI,
        provider
      );
      //TODO: Replace with actual tournament ID if needed
      // For now, we assume tournament ID is 0 for simplicity
      const filter = contract.filters.TournamentScoreSubmitted(0, null, null);
      const events = await contract.queryFilter(filter);

      const totals = {};
      events.forEach(e => {
        if ("args" in e && Array.isArray(e.args)) {
          const player = e.args[1];
          const score = Number(e.args[2]);
          totals[player] = (totals[player] || 0) + score;
        }
      });

      const sorted = Object.entries(totals)
        .map(([player, score]) => ({ player, score: Number(score) }))
        .sort((a, b) => b.score - a.score);

      setLeaderboard(sorted);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchLeaderboard();
  };

  // Polling mechanism
  useEffect(() => {
    fetchLeaderboard(); // Initial fetch
    intervalRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

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
                {leaderboard.map((player) => (
                  <div key={player.player} className="cuursor-pointer flex items-center p-4 border border-green-400 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
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
                        <p className="text-lg text-cyan-400">1</p>
                        <p className="text-sm text-green-400">GAMES</p>
                      </div>
                      
                      
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    // <div>
    //   <h2>Leaderboard</h2>
    //   <button onClick={handleRefresh} disabled={loading} style={{ marginBottom: "1rem" }}>
    //     {loading ? "Refreshing..." : "Refresh"}
    //   </button>
    //   {loading ? (
    //     <p>Loading...</p>
    //   ) : (
    //     <ol>
    //       {leaderboard.map((entry, i) => (
    //         <li key={entry.player}>
    //           #{i + 1} {entry.player.slice(0, 6)}...{entry.player.slice(-4)}: {entry.score}
    //         </li>
    //       ))}
    //     </ol>
    //   )}
    // </div>
  );
};

export default Leaderboard;