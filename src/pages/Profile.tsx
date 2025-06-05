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
import useProfileStore from '../stores/useProfileStore';

const Profile = () => {
  const {
    username,
    bio,
    avatar,
    stats,
    loading,
    achievements,
    history,
  } = useProfileStore();

  // Fallback UI while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <span className="text-cyan-400 text-xl">Loading profile...</span>
        </div>
      </div>
    );
  }

  // If no profile found
  if (!username) {
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono">
          <Header />
          <div className="flex justify-center items-center h-screen">
            <span className="text-red-400 text-xl">Profile not found.</span>
          </div>
        </div>
    );
  }

  // Format helpers
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
                    <img src={avatar || "/placeholder.svg"} alt="avatar" className="w-20 h-20 rounded-full" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-cyan-400 mb-2">{username || "GAMER"}</h1>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-yellow-400 text-black">RANK N/A</Badge>
                      <Badge className="bg-green-400 text-black">LEVEL N/A</Badge>
                      {/* Optionally show join date if you add it to your store */}
                    </div>
                  </div>
                </div>
                <Button className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono">
                  <Edit className="w-4 h-4 mr-2" />
                  EDIT PROFILE
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Stats */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">&gt; STATS</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL SCORE:</span>
                      <span className="text-yellow-400 font-bold">{stats.totalScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES PLAYED:</span>
                      <span className="text-cyan-400 font-bold">{stats.gamesPlayed || 0}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-green-400">GAMES WON:</span>
                      <span className="text-cyan-400 font-bold">{stats.gamesWon || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">WIN RATE:</span>
                      <span className="text-green-400 font-bold">{stats.winRate || 0}%</span>
                    </div> */}
                    <div className="flex justify-between border-t border-green-400 pt-4">
                      <span className="text-green-400">TOTAL EARNINGS:</span>
                      <span className="text-yellow-400 font-bold">N/A</span>
                    </div>
                  </div>
                </Card>

                {/* Achievements */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">&gt; ACHIEVEMENTS</h2>
                  <div className="space-y-3">
                    {(!achievements || achievements.length === 0) && (
                      <div className="text-gray-400">No achievements yet.</div>
                    )}
                    {achievements && achievements.map((ach, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-green-400 bg-green-400/10">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <div className="flex-1">
                          <p className="font-bold text-cyan-400">{ach.title}</p>
                          <p className="text-sm text-green-400">{ach.description}</p>
                        </div>
                        <Badge className="bg-yellow-400 text-black text-xs">EARNED</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Games Column */}
              <div className="lg:col-span-2">
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-cyan-400">&gt; RECENT GAMES</h2>
                    <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                      VIEW ALL
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(!history || history.length === 0) && (
                      <div className="text-gray-400">No games played yet.</div>
                    )}
                    {history && history.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-green-400 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Gamepad2 className="w-8 h-8 text-cyan-400" />
                          <div>
                            <p className="font-bold text-cyan-400">{game.game}</p>
                            <p className="text-sm text-green-400">{formatDate(game.date)}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <Badge className={game.result === 'WIN' ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}>
                            {game.result || "N/A"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-400">{game.score?.toLocaleString() || 0}</p>
                          <p className="text-sm text-green-400">SCORE</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-400">{game.prize || "N/A"}</p>
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