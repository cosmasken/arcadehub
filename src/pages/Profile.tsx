import Layout from "../components/Layout";
import React, { useEffect } from 'react';
import Navigation from '../components/Navigation';
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
  Edit,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';
import useProfileStore from '../stores/useProfileStore';
import useWalletStore from '../stores/useWalletStore';
import { Link } from "react-router-dom";

const Profile = () => {
  const {
    username,
    bio,
    avatar,
    stats,
    loading,
    achievements,
    history,
    role,
    adminStats,
    sponsorStats,
    developerStats,
    fetchProfile,
  } = useProfileStore();

  const { aaWalletAddress, isConnected } = useWalletStore();

  // Fetch profile when component mounts or wallet address changes
  useEffect(() => {
    if (isConnected && aaWalletAddress) {
      console.log('Fetching profile for:', aaWalletAddress);
      fetchProfile(aaWalletAddress);
    }
  }, [isConnected, aaWalletAddress, fetchProfile]);

  // Fallback UI while loading
  if (loading) {
    return (
      <Layout>

        <div className="flex justify-center items-center min-h-[50vh]">
          <span className="text-cyan-400 text-xl">Loading profile...</span>
        </div>

      </Layout>
    );
  }

  // If no wallet connected
  if (!isConnected || !aaWalletAddress) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <span className="text-cyan-400 text-xl">Please connect your wallet to view profile.</span>
        </div>
      </Layout>
    );
  }

  // If no profile found
  if (!username && !loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern">
          <Navigation />
          <main className="container mx-auto px-4 py-24 md:py-8">
            <div className="flex justify-center items-center min-h-[50vh]">
              <span className="text-red-400 text-xl">Profile not found.</span>
            </div>
          </main>
        </div>
      </Layout>
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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="bg-black border-cyan-400 border-2 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="w-24 h-24 border-4 border-cyan-400 rounded bg-gray-900 flex items-center justify-center">
                <img src={avatar || "/placeholder.jpeg"} alt="avatar" className="w-20 h-20 rounded-full" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-cyan-400 mb-2">{username || "USER"}</h1>
                <div className="flex items-center space-x-4">
                  <Badge className={`${role === 'admin' ? 'bg-red-400 text-black' :
                    role === 'sponsor' ? 'bg-yellow-400 text-black' :
                      role === 'developer' ? 'bg-purple-400 text-black' :
                        'bg-green-400 text-black'
                    }`}>
                    {role?.toUpperCase() || 'PLAYER'}
                  </Badge>
                  <Badge className="bg-blue-400 text-black">RANK N/A</Badge>
                  {bio && <span className="text-green-400 text-sm">{bio}</span>}
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
            {/* Quick Stats - Different based on role */}
            <Card className="bg-black border-cyan-400 border-2 p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">
                {role === 'admin' ? '⚡ ADMIN STATS' :
                  role === 'sponsor' ? '💰 SPONSOR STATS' :
                    role === 'developer' ? '🔧 DEV STATS' :
                      '🎮 PLAYER STATS'}
              </h2>
              <div className="space-y-4">
                {role === 'admin' && adminStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL USERS:</span>
                      <span className="text-yellow-400 font-bold">{adminStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">TOURNAMENTS:</span>
                      <span className="text-cyan-400 font-bold">{adminStats.totalTournaments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">SYSTEM HEALTH:</span>
                      <span className="text-green-400 font-bold">{adminStats.systemHealth}</span>
                    </div>
                  </>
                )}

                {role === 'sponsor' && sponsorStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL SPONSORED:</span>
                      <span className="text-yellow-400 font-bold">{sponsorStats.totalSponsored} NERO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">ACTIVE TOURNAMENTS:</span>
                      <span className="text-cyan-400 font-bold">{sponsorStats.activeTournaments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">COMPLETED:</span>
                      <span className="text-green-400 font-bold">{sponsorStats.completedTournaments}</span>
                    </div>
                  </>
                )}

                {role === 'developer' && developerStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES PUBLISHED:</span>
                      <span className="text-yellow-400 font-bold">{developerStats.totalGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL PLAYS:</span>
                      <span className="text-cyan-400 font-bold">{developerStats.totalPlays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">AVG RATING:</span>
                      <span className="text-green-400 font-bold">{developerStats.avgRating.toFixed(1)}/5</span>
                    </div>
                  </>
                )}

                {(role === 'gamer' || role === 'player' || !role) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-green-400">TOTAL SCORE:</span>
                      <span className="text-yellow-400 font-bold">{stats.totalScore?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES PLAYED:</span>
                      <span className="text-cyan-400 font-bold">{stats.gamesPlayed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">ACHIEVEMENTS:</span>
                      <span className="text-green-400 font-bold">{achievements?.length || 0}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between border-t border-green-400 pt-4">
                  <span className="text-green-400">WALLET:</span>
                  <span className="text-yellow-400 font-bold text-xs">
                    {aaWalletAddress ? `${aaWalletAddress.slice(0, 6)}...${aaWalletAddress.slice(-4)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="bg-black border-cyan-400 border-2 p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">🏆 ACHIEVEMENTS</h2>
              <div className="space-y-3">
                {(!achievements || achievements.length === 0) && (
                  <div className="text-gray-400">No achievements yet.</div>
                )}
                {achievements && achievements.map((ach, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-green-400 bg-green-400/10">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div className="flex-1">
                      <p className="font-bold text-cyan-400">{ach.title || 'Achievement'}</p>
                      <p className="text-sm text-green-400">{ach.description || 'Earned achievement'}</p>
                    </div>
                    <Badge className="bg-yellow-400 text-black text-xs">EARNED</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Role-specific action buttons */}
            {role === 'admin' && (
              <Card className="bg-black border-red-400 border-2 p-6">
                <h2 className="text-xl font-bold text-red-400 mb-4 font-mono tracking-tight">⚡ ADMIN ACTIONS</h2>
                <div className="space-y-3">
                  <Button variant="destructive" className="w-full font-mono">
                    <Shield className="w-4 h-4 mr-2" />
                    ADMIN PANEL
                  </Button>
                  <Button variant="outline" className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-mono focus-visible:ring-2 focus-visible:ring-red-400">
                    <Users className="w-4 h-4 mr-2" />
                    MANAGE USERS
                  </Button>
                </div>
              </Card>
            )}

            {role === 'sponsor' && (
              <Card className="bg-black border-yellow-400 border-2 p-6">
                <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono tracking-tight">💰 SPONSOR ACTIONS</h2>
                <div className="space-y-3">
                  <Button asChild variant="default" className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-mono focus-visible:ring-2 focus-visible:ring-yellow-400">
                    <Link to="/create-tournament">
                      <Trophy className="w-4 h-4 mr-2" />
                      CREATE TOURNAMENT
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-mono focus-visible:ring-2 focus-visible:ring-yellow-400">
                    <Link to="/sponsor-analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      VIEW ANALYTICS
                    </Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Recent Games / Role-specific Content Column */}
          <div className="lg:col-span-2">
            <Card className="bg-black border-cyan-400 border-2 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-cyan-400">
                  {role === 'admin' ? '🔧 RECENT ADMIN ACTIVITY' :
                    role === 'sponsor' ? '🏆 MY TOURNAMENTS' :
                      role === 'developer' ? '🎮 MY GAMES' :
                        '🎮 RECENT GAMES'}
                </h2>
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


    </Layout>
  );
};

export default Profile;