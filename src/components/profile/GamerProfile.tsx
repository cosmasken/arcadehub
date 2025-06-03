import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Gamepad2, Play, Target, Clock, Award } from 'lucide-react';
import useProfileStore from '../../stores/useProfileStore';

const GamerProfile = () => {
  const {
    username,
    bio,
    avatar,
    stats,
    loading,
    achievements,
    history,
  } = useProfileStore();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {username ? username.charAt(0).toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{username}</h1>
              <Badge className="bg-blue-600">
                <Gamepad2 className="h-3 w-3 mr-1" />
                Gamer
              </Badge>
            </div>
            <p className="text-blue-200 mb-2">{bio}</p>
            {/* Optionally show join date if you add it to your store */}
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
                  <p className="text-2xl font-bold text-white">{stats.gamesPlayed}</p>
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
                  <p className="text-2xl font-bold text-white">{stats.totalScore.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-white">
                    {formatDuration(
                      history.reduce((acc, h) => acc + (parseInt(h.duration || '0', 10)), 0)
                    )}
                  </p>
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
                  <p className="text-2xl font-bold text-white">{stats.achievements}</p>
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
                  {history.length === 0 && (
                    <div className="text-blue-200">No recent games played.</div>
                  )}
                  {history.map((play) => (
                    <div key={play.id} className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white capitalize">
                            {play.game}
                          </h3>
                          <p className="text-sm text-blue-200">
                            {formatDate(play.date)} • {formatDuration(parseInt(play.duration || '0', 10))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{play.score?.toLocaleString()} pts</p>
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
                <div className="text-blue-200">
                  {achievements === 0 ? "No achievements yet." : `Total Achievements: ${achievements}`}
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