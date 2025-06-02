import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad2, 
  Trophy, 
  Calendar, 
  Play,
  Target,
  Clock,
  Award
} from 'lucide-react';

// Mock data for gamer
const mockGamerProfile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  wallet_address: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
  username: "ProGamer123",
  bio: "Passionate gamer and blockchain enthusiast. Always looking for the next challenge!",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-06-01T15:45:00Z"
};

const mockGamePlays = [
  {
    id: "play-1",
    game_id: "racing-thunder",
    player_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    played_at: "2024-06-01T14:30:00Z",
    session_duration: 1800,
    score: 15420,
    device: "desktop"
  },
  {
    id: "play-2",
    game_id: "space-wars",
    player_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    played_at: "2024-05-30T20:15:00Z",
    session_duration: 2400,
    score: 8750,
    device: "mobile"
  },
  {
    id: "play-3",
    game_id: "puzzle-quest",
    player_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    played_at: "2024-05-29T16:45:00Z",
    session_duration: 900,
    score: 3200,
    device: "desktop"
  }
];

const mockUserAchievements = [
  {
    id: "ach-1",
    user_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    achievement_id: 1,
    progress: 100,
    unlocked: true,
    unlocked_at: "2024-05-25T10:00:00Z",
    achievement: {
      id: 1,
      title: "First Victory",
      description: "Win your first game",
      rarity: "Common",
      max_progress: 1
    }
  },
  {
    id: "ach-2",
    user_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    achievement_id: 2,
    progress: 75,
    unlocked: false,
    unlocked_at: null,
    achievement: {
      id: 2,
      title: "Score Master",
      description: "Reach 10,000 points in any game",
      rarity: "Rare",
      max_progress: 100
    }
  },
  {
    id: "ach-3",
    user_wallet: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    achievement_id: 3,
    progress: 100,
    unlocked: true,
    unlocked_at: "2024-05-28T18:30:00Z",
    achievement: {
      id: 3,
      title: "Speed Demon",
      description: "Complete 5 games in under 10 minutes each",
      rarity: "Epic",
      max_progress: 5
    }
  }
];

const GamerProfile = () => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalPlayTime = mockGamePlays.reduce((acc, play) => acc + (play.session_duration || 0), 0);
  const totalScore = mockGamePlays.reduce((acc, play) => acc + (play.score || 0), 0);
  const unlockedAchievements = mockUserAchievements.filter(ua => ua.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {mockGamerProfile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{mockGamerProfile.username}</h1>
              <Badge className="bg-blue-600">
                <Gamepad2 className="h-3 w-3 mr-1" />
                Gamer
              </Badge>
            </div>
            <p className="text-blue-200 mb-2">{mockGamerProfile.bio}</p>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              Joined {formatDate(mockGamerProfile.created_at)}
            </div>
          </div>

          <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
            Edit Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Games Played</p>
                  <p className="text-2xl font-bold text-white">{mockGamePlays.length}</p>
                </div>
                <Play className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Total Score</p>
                  <p className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Play Time</p>
                  <p className="text-2xl font-bold text-white">{formatDuration(totalPlayTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Achievements</p>
                  <p className="text-2xl font-bold text-white">{unlockedAchievements}/{mockUserAchievements.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="recent-games" className="space-y-6">
          <TabsList className="bg-blue-800/30 border-blue-700/50">
            <TabsTrigger value="recent-games" className="data-[state=active]:bg-blue-600">
              Recent Games
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent-games">
            <Card className="bg-blue-800/30 border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Game Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGamePlays.map((play) => (
                    <div key={play.id} className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white capitalize">
                            {play.game_id.replace('-', ' ')}
                          </h3>
                          <p className="text-sm text-blue-200">
                            {formatDate(play.played_at)} • {formatDuration(play.session_duration || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{play.score?.toLocaleString()} pts</p>
                        <p className="text-sm text-blue-200">{play.device}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-blue-800/30 border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white">Achievements Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockUserAchievements.map((userAch) => (
                    <div key={userAch.id} className={`p-4 rounded-lg border ${
                      userAch.unlocked 
                        ? 'bg-green-900/30 border-green-700/50' 
                        : 'bg-gray-900/30 border-gray-700/50'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Trophy className={`h-6 w-6 ${
                            userAch.unlocked ? 'text-yellow-400' : 'text-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-white">{userAch.achievement.title}</h3>
                            <Badge className={`text-xs ${getRarityColor(userAch.achievement.rarity)}`}>
                              {userAch.achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-blue-200 mb-3">{userAch.achievement.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{userAch.progress}/{userAch.achievement.max_progress}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              userAch.unlocked ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ 
                              width: `${Math.min((userAch.progress / userAch.achievement.max_progress) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        {userAch.unlocked && userAch.unlocked_at && (
                          <p className="text-xs text-green-400">
                            Unlocked {formatDate(userAch.unlocked_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamerProfile;
// This