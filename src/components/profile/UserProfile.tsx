
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Gamepad, Settings, Edit, Share2, Trophy, Clock, ArrowRight, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import AccountSettings from "./AccountSettings";
import InviteFriends from "./InviteFriends";

const UserProfile = () => {
  // Sample data
  const user = {
    username: "GamerX",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=GamerX",
    bio: "Passionate arcade gamer and developer. I love puzzle games and racing games.",
    arcBalance: 200,
    gamesPlayed: 45,
    achievements: 12,
    assets: [
      { id: "nft1", name: "Star Trophy", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
      { id: "nft2", name: "Race Car", image: "https://images.unsplash.com/photo-1621385291484-8f8082da1e14?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
    ],
    history: [
      { game: "Star Blaster", score: "1028", date: "2025-05-18" },
      { game: "Puzzle Pop", score: "325", date: "2025-05-17" },
      { game: "Turbo Dash", score: "582", date: "2025-05-15" },
    ],
    developerGames: [
      { id: "game1", title: "Space Adventure", plays: 235, revenue: 50 },
    ],
  };

  return (
    <div className="container mx-auto px-4 my-8">
      {/* Profile Header */}
      <div className="bg-secondary rounded-xl border border-muted/20 mb-6 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img 
              src={user.avatar} 
              alt={user.username}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-arcade-purple/50"
            />
            <button className="absolute bottom-0 right-0 bg-arcade-purple text-white rounded-full p-2 opacity-80 hover:opacity-100 transition-opacity">
              <Edit size={16} />
            </button>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
              <div className="flex justify-center sm:justify-start gap-2">
                <span className="bg-arcade-blue/20 text-arcade-blue text-xs px-2 py-1 rounded-full">
                  Gamer
                </span>
                <span className="bg-arcade-purple/20 text-arcade-purple text-xs px-2 py-1 rounded-full">
                  Developer
                </span>
              </div>
            </div>
            <p className="text-white/70 mb-4">{user.bio}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/5"
              >
                <Edit size={14} className="mr-1" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/20 hover:bg-white/5"
              >
                <Share2 size={14} className="mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="hidden md:block bg-muted rounded-lg p-4 text-center min-w-36">
            <p className="text-white/60 text-sm mb-1">ARC Balance</p>
            <p className="text-xl font-bold flex items-center justify-center">
              <span className="w-4 h-4 bg-arcade-yellow rounded-full inline-block mr-2"></span>
              {user.arcBalance}
            </p>
          </div>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <Tabs defaultValue="gamer">
        <TabsList className="w-full bg-muted border border-muted/30 rounded-lg p-1 mb-6">
          <TabsTrigger value="gamer" className="data-[state=active]:bg-arcade-blue data-[state=active]:text-white">
            <User size={16} className="mr-2" />
            Gamer
          </TabsTrigger>
          <TabsTrigger value="developer" className="data-[state=active]:bg-arcade-purple data-[state=active]:text-white">
            <Gamepad size={16} className="mr-2" />
            Developer
          </TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-arcade-green data-[state=active]:text-white">
            <Users size={16} className="mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
            <Settings size={16} className="mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Gamer Tab */}
        <TabsContent value="gamer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4 col-span-3 md:col-span-1">
              <Card className="bg-secondary border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/60">ARC Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <span className="w-4 h-4 bg-arcade-yellow rounded-full inline-block mr-2"></span>
                    {user.arcBalance}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/60">Games Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <Gamepad size={16} className="text-arcade-blue mr-2" />
                    {user.gamesPlayed}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/60">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <Trophy size={16} className="text-arcade-yellow mr-2" />
                    {user.achievements}
                  </div>
                </CardContent>
              </Card>
              
              {/* Assets */}
              <Card className="col-span-3 bg-secondary border-muted/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Assets</CardTitle>
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                      View all
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {user.assets.map(asset => (
                      <div 
                        key={asset.id}
                        className="bg-muted rounded-lg overflow-hidden border border-muted/30 hover:border-arcade-purple/50 transition-colors cursor-pointer group"
                      >
                        <div className="h-24 overflow-hidden">
                          <img 
                            src={asset.image} 
                            alt={asset.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game History */}
            <Card className="col-span-3 md:col-span-2 bg-secondary border-muted/20">
              <CardHeader>
                <CardTitle>Recent Game History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.history.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Gamepad size={20} className="text-arcade-blue" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.game}</h4>
                            <p className="text-sm text-white/60">Score: {item.score}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-white/60">
                          <Clock size={14} className="mr-1" />
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      {index < user.history.length - 1 && <Separator className="my-4 bg-muted/30" />}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    className="border-white/20 hover:bg-white/5"
                  >
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Developer Tab */}
        <TabsContent value="developer">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-secondary border-muted/20">
              <CardHeader>
                <CardTitle>Developer Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-white/60 mb-1">Total Games</p>
                    <p className="text-2xl font-bold">{user.developerGames.length}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-white/60 mb-1">Total Plays</p>
                    <p className="text-2xl font-bold">{user.developerGames.reduce((sum, game) => sum + game.plays, 0)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-white/60 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold flex items-center">
                      <span className="w-4 h-4 bg-arcade-yellow rounded-full inline-block mr-2"></span>
                      {user.developerGames.reduce((sum, game) => sum + game.revenue, 0)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full bg-arcade-blue hover:bg-arcade-blue/80">
                    Upload New Game
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 bg-secondary border-muted/20">
              <CardHeader>
                <CardTitle>My Games</CardTitle>
              </CardHeader>
              <CardContent>
                {user.developerGames.length > 0 ? (
                  <div className="space-y-4">
                    {user.developerGames.map(game => (
                      <div key={game.id} className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h4 className="font-medium mb-1">{game.title}</h4>
                          <p className="text-sm text-white/60">{game.plays} Plays</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-white/60">Revenue</p>
                            <p className="font-medium flex items-center justify-end">
                              <span className="w-3 h-3 bg-arcade-yellow rounded-full inline-block mr-1"></span>
                              {game.revenue}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 mb-4">You haven't uploaded any games yet.</p>
                    <Button className="bg-arcade-blue hover:bg-arcade-blue/80">
                      Upload Your First Game
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Friends Tab */}
        <TabsContent value="friends">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InviteFriends />
            
            {/* Friends List Placeholder */}
            <Card className="lg:col-span-2 bg-secondary border-muted/20">
              <CardHeader>
                <CardTitle>Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-white/60 mb-4">Start connecting with friends to see them here!</p>
                  <Button className="bg-arcade-green hover:bg-arcade-green/80">
                    Find Friends
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
