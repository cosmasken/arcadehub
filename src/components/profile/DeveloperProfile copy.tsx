import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Gamepad2, 
  Trophy, 
  Star, 
  Calendar, 
  Play
} from 'lucide-react';

// Mock data for developer
const mockDeveloperProfile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  wallet_address: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
  username: "GameDev123",
  bio: "Passionate game developer creating innovative blockchain games. Always pushing the boundaries of gaming!",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-06-01T15:45:00Z"
};

const mockDeveloperGames = [
  {
    game_id: "space-adventure",
    title: "Space Adventure",
    description: "Epic space exploration game with stunning graphics",
    category: "Action",
    developer: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    created_at: "2024-03-01T12:00:00Z"
  },
  {
    game_id: "puzzle-master",
    title: "Puzzle Master",
    description: "Mind-bending puzzle challenges for all ages",
    category: "Puzzle",
    developer: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    created_at: "2024-04-15T09:30:00Z"
  },
  {
    game_id: "racing-thunder",
    title: "Racing Thunder",
    description: "High-speed racing with blockchain rewards",
    category: "Racing",
    developer: "0x742d35Cc6634C0532925a3b8D8C6A8C48c64982e",
    created_at: "2024-05-10T14:20:00Z"
  }
];

const DeveloperProfile = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-green-600 text-white text-2xl">
              {mockDeveloperProfile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{mockDeveloperProfile.username}</h1>
              <Badge className="bg-green-600">
                <User className="h-3 w-3 mr-1" />
                Developer
              </Badge>
            </div>
            <p className="text-blue-200 mb-2">{mockDeveloperProfile.bio}</p>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              Joined {formatDate(mockDeveloperProfile.created_at)}
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
                  <p className="text-sm text-blue-200">Games Published</p>
                  <p className="text-2xl font-bold text-white">{mockDeveloperGames.length}</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-800/30 border-blue-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Total Downloads</p>
                  <p className="text-2xl font-bold text-white">2,847</p>
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
                  <p className="text-2xl font-bold text-white">4.7</p>
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
                  <p className="text-2xl font-bold text-white">$3,456</p>
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
                  {mockDeveloperGames.map((game) => (
                    <div key={game.game_id} className="p-4 bg-blue-900/30 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{game.title}</h3>
                          <Badge variant="outline" className="text-blue-300 border-blue-300">
                            {game.category}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <p className="text-blue-200 text-sm mb-3">{game.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Published {formatDate(game.created_at)}</span>
                        <div className="flex items-center space-x-4">
                          <span>Downloads: 847</span>
                          <span>Rating: 4.6</span>
                        </div>
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