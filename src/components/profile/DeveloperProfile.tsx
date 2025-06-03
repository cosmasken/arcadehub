import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Gamepad2, Trophy, Star, Play } from 'lucide-react';
import useProfileStore from '../../stores/useProfileStore';

const DeveloperProfile = () => {
  const {
    username,
    bio,
    avatar,
    developerGames,
    developerStats,
    loading,
  } = useProfileStore();


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
            <AvatarFallback className="bg-green-600 text-white text-2xl">
              {username ? username.charAt(0).toUpperCase() : "D"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{username}</h1>
              <Badge className="bg-green-600">
                <User className="h-3 w-3 mr-1" />
                Developer
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
                  <p className="text-sm text-blue-200">Games Published</p>
                  <p className="text-2xl font-bold text-white">{developerStats.totalGames}</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Total Plays</p>
                  <p className="text-2xl font-bold text-white">{developerStats.totalPlays}</p>
                </div>
                <Play className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Avg Rating</p>
                  <p className="text-2xl font-bold text-white">{developerStats.avgRating.toFixed(2)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Revenue</p>
                  <p className="text-2xl font-bold text-white">${developerStats.totalRevenue}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="published-games" className="space-y-6">
          <TabsList className="bg-blue-800/30 border-blue-700/50">
            <TabsTrigger value="published-games" className="data-[state=active]:bg-blue-600">
              Published Games
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published-games">
            <Card className="bg-blue-800/30 border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white">Your Published Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {developerGames.length === 0 && (
                    <div className="text-blue-200">No games published yet.</div>
                  )}
                  {developerGames.map((game) => (
                    <div key={game.id} className="p-4 bg-blue-900/30 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{game.title}</h3>
                          <Badge variant="outline" className="text-blue-300 border-blue-300">
                            {game.status || "Published"}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <p className="text-blue-200 text-sm mb-3">{game.title}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Plays {game.plays}</span>
                        {/* Add more game stats here if available */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-blue-800/30 border-blue-700/50">
              <CardHeader>
                <CardTitle className="text-white">Game Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-blue-200 py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p>Detailed analytics and performance metrics for your games will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperProfile;