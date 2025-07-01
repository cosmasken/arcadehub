
import React from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Trophy, 
  Medal, 
  Target, 
  TrendingUp,
  Calendar,
  Gamepad2,
  Zap,
  Star,
  Award,
  Edit
} from 'lucide-react';

const Profile = () => {
  const playerStats = {
    name: "CYBER_WARRIOR_X",
    rank: 15,
    totalScore: 1247680,
    gamesPlayed: 89,
    gamesWon: 67,
    winRate: 75,
    totalEarnings: "12.47 NERO",
    memberSince: "2024-01-15",
    level: 42,
    xp: 15847,
    nextLevelXp: 20000
  };

  const recentGames = [
    { game: "Crypto Battles", result: "WIN", score: 15678, prize: "0.15 NERO", date: "2024-06-12" },
    { game: "NFT Racing", result: "WIN", score: 12456, prize: "0.08 NERO", date: "2024-06-11" },
    { game: "DeFi Quest", result: "LOSS", score: 8901, prize: "0 NERO", date: "2024-06-10" },
    { game: "Pixel Warriors", result: "WIN", score: 23456, prize: "0.12 NERO", date: "2024-06-09" },
    { game: "MetaVerse Poker", result: "WIN", score: 18765, prize: "0.25 NERO", date: "2024-06-08" }
  ];

  const achievements = [
    { title: "FIRST VICTORY", description: "Win your first game", icon: Trophy, earned: true },
    { title: "STREAK MASTER", description: "Win 10 games in a row", icon: Zap, earned: true },
    { title: "HIGH ROLLER", description: "Earn 10+ NERO", icon: Star, earned: true },
    { title: "TOURNAMENT KING", description: "Win a tournament", icon: Medal, earned: false },
    { title: "LEGENDARY", description: "Reach level 50", icon: Award, earned: false },
    { title: "PERFECT SCORE", description: "Get maximum score in any game", icon: Target, earned: false }
  ];

  return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-6xl">
            {/* Profile Header */}
            <Card className="bg-black border-cyan-400 border-2 p-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-24 h-24 border-4 border-cyan-400 rounded bg-gray-900 flex items-center justify-center">
                    <Gamepad2 className="w-12 h-12 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-cyan-400 mb-2">{playerStats.name}</h1>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-yellow-400 text-black">RANK #{playerStats.rank}</Badge>
                      <Badge className="bg-green-400 text-black">LEVEL {playerStats.level}</Badge>
                      <span className="text-green-400">MEMBER SINCE {playerStats.memberSince}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono">
                  <Edit className="w-4 h-4 mr-2" />
                  EDIT PROFILE
                </Button>
              </div>
              
              {/* Level Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-400">LEVEL PROGRESS</span>
                  <span className="text-cyan-400">{playerStats.xp}/{playerStats.nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-gray-800 h-3 border border-green-400">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${(playerStats.xp / playerStats.nextLevelXp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Stats */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4"> STATS</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL SCORE:</span>
                      <span className="text-yellow-400 font-bold">{playerStats.totalScore.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES PLAYED:</span>
                      <span className="text-cyan-400 font-bold">{playerStats.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES WON:</span>
                      <span className="text-cyan-400 font-bold">{playerStats.gamesWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">WIN RATE:</span>
                      <span className="text-green-400 font-bold">{playerStats.winRate}%</span>
                    </div>
                    <div className="flex justify-between border-t border-green-400 pt-4">
                      <span className="text-green-400">TOTAL EARNINGS:</span>
                      <span className="text-yellow-400 font-bold">{playerStats.totalEarnings}</span>
                    </div>
                  </div>
                </Card>

                {/* Achievements */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4"> ACHIEVEMENTS</h2>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 border ${achievement.earned ? 'border-green-400 bg-green-400/10' : 'border-gray-600 bg-gray-900/50'}`}>
                        <achievement.icon className={`w-6 h-6 ${achievement.earned ? 'text-yellow-400' : 'text-gray-500'}`} />
                        <div className="flex-1">
                          <p className={`font-bold ${achievement.earned ? 'text-cyan-400' : 'text-gray-500'}`}>
                            {achievement.title}
                          </p>
                          <p className={`text-sm ${achievement.earned ? 'text-green-400' : 'text-gray-600'}`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <Badge className="bg-yellow-400 text-black text-xs">EARNED</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Games Column */}
              <div className="lg:col-span-2">
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-cyan-400"> RECENT GAMES</h2>
                    <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                      VIEW ALL
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-green-400 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Gamepad2 className="w-8 h-8 text-cyan-400" />
                          <div>
                            <p className="font-bold text-cyan-400">{game.game}</p>
                            <p className="text-sm text-green-400">{game.date}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Badge className={game.result === 'WIN' ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}>
                            {game.result}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-yellow-400">{game.score.toLocaleString()}</p>
                          <p className="text-sm text-green-400">SCORE</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-yellow-400">{game.prize}</p>
                          <p className="text-sm text-green-400">PRIZE</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;
