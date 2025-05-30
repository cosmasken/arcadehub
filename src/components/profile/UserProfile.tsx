import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Edit, Share, Settings, User, Users } from 'lucide-react';
import  useProfileStore  from '../../stores/useProfileStore';
import useWalletStore  from '../../stores/useWalletStore';
import { AccountSettings } from './AccountSettings';
import supabase from '../../hooks/use-supabase';
import { useToast } from '../../hooks/use-toast';

export const UserProfile = () => {
  const { stats, history, friends, } = useProfileStore();
  const { toast } = useToast();
  const {address } = useWalletStore();
    const {
    username,
    bio,
    avatar,
    arcBalance,
    assets,
    developerGames,
    developerStats,
    setUsername,
    setBio,
    fetchProfile,
  } = useProfileStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [editUsername, setEditUsername] = useState(username);
  const [editBio, setEditBio] = useState(bio);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: editUsername, bio: editBio })
      .eq('username', username); // or use wallet_address if available
    setSaving(false);
    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsername(editUsername);
      setBio(editBio);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      // Optionally refetch profile from supabase
      await fetchProfile(address);
    }
  };


  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'review': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };



  const handleInviteFriend = () => {
    if (inviteEmail) {
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail('');
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Profile Link Copied",
      description: "Your profile link has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 bg-white/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-purple-500/50">
                <AvatarImage src={avatar} alt={username} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                  <h1 className="text-3xl font-bold text-white">{username}</h1>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    {stats.rank}
                  </Badge>
                </div>
                <p className="text-gray-300 mb-4 max-w-2xl">{bio}</p>
                
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShareProfile} className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                 
                </div>
              </div>

              {/* ARC Balance */}
              <div className="hidden lg:block">
                <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {arcBalance.toFixed(2)}
                    </div>
                    <div className="text-purple-300 text-sm">ARC Balance</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile ARC Balance */}
        <Card className="lg:hidden mb-6 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-white mb-1">
              {arcBalance.toFixed(2)} ARC
            </div>
            <div className="text-purple-300 text-sm">Current Balance</div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="gamer" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 border-purple-500/30">
            <TabsTrigger value="gamer" className="data-[state=active]:bg-purple-600">
              <User className="w-4 h-4 mr-2" />
              Gamer
            </TabsTrigger>
            <TabsTrigger value="developer" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Gamer Tab */}
          <TabsContent value="gamer" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
                  <div className="text-gray-400 text-sm">Games Played</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.achievements}</div>
                  <div className="text-gray-400 text-sm">Achievements</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.totalScore.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Total Score</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.rank}</div>
                  <div className="text-gray-400 text-sm">Rank</div>
                </CardContent>
              </Card>
            </div>

            {/* Assets Grid */}
            <Card className="bg-white/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">NFT Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="relative group cursor-pointer">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={asset.image} 
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityColor(asset.rarity ?? '')}`}></div>
                      <div className="mt-2">
                        <div className="text-white font-medium text-sm">{asset.name}</div>
                        <div className="text-purple-300 text-xs">{asset.value} ARC</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game History */}
            <Card className="bg-white/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{game.game}</div>
                        <div className="text-gray-400 text-sm">{game.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-300 font-bold">{game.score.toLocaleString()}</div>
                        <div className="text-gray-400 text-sm">{game.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-6">
            {/* Developer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{developerStats.totalGames}</div>
                  <div className="text-gray-400 text-sm">Total Games</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{developerStats.totalPlays.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Total Plays</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">${developerStats.totalRevenue.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-white/50 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{developerStats.avgRating}</div>
                  <div className="text-gray-400 text-sm">Avg Rating</div>
                </CardContent>
              </Card>
            </div>

            {/* Developer Games */}
            <Card className="bg-white/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">My Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {developerGames.map((game) => (
                    <div key={game.id} className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-lg">
                      <img 
                        src={game.image} 
                        alt={game.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{game.title}</h3>
                          <Badge className={`${getStatusColor(game.status ?? '')} text-white text-xs`}>
                            {game.status}
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {game.plays.toLocaleString()} plays • ${game.revenue.toFixed(2)} revenue
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-6">
            {/* Invite Friends */}
            <Card className="bg-white/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Invite Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-white/50 border-purple-500/30 text-white"
                  />
                  <Button onClick={handleInviteFriend} className="bg-purple-600 hover:bg-purple-700">
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Friends List */}
            <Card className="bg-white/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Friends ({friends.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar} alt={friend.username} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {friend.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {friend.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{friend.username}</div>
                        <div className="text-gray-400 text-sm">
                          {friend.online ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            {/* <AccountSettings />
             */}
              <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-medium text-white mb-1">
                    Username
                  </label>
                  <Input
                    id="edit-username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="edit-bio" className="block text-sm font-medium text-white mb-1">
                    Bio
                  </label>
                  <Input
                    id="edit-bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
