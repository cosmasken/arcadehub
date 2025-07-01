import Layout from "../components/Layout";
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft,
  Users, 
  Trophy,
  Star,
  Calendar,
  ExternalLink,
  MapPin,
  Github,
  Twitter,
  Globe,
  GamepadIcon,
  Download
} from 'lucide-react';
import supabase from '../hooks/use-supabase';

import { DeveloperProfile, GameProfile } from '../types/developer';

function useDeveloperProfile(walletAddress: string | undefined) {
  const [profile, setProfile] = React.useState<DeveloperProfile | null>(null);
  const [games, setGames] = React.useState<GameProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);

    const fetchData = async () => {
      // Fetch developer profile from users table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      // Fetch games published by this developer
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .eq('developer', walletAddress);

      setProfile(profile);
      setGames(games || []);
      setLoading(false);
    };

    fetchData();
  }, [walletAddress]);

  return { profile, games, loading };
}

const DeveloperProfile = () => {
  const { id } = useParams(); // id is developer wallet address
  const { profile, games, loading } = useDeveloperProfile(id);

  if (loading) {
    return (
    <Layout>
      
        <div className="min-h-screen bg-black text-green-400 font-mono">
          
          <div className="flex justify-center items-center h-screen">
            <span className="text-cyan-400 text-xl">Loading developer profile...</span>
          </div>
        </div>
  
    </Layout>
  );
  }

  if (!profile) {
    return (
    <Layout>
      
        <div className="min-h-screen bg-black text-green-400 font-mono">
          
          <div className="flex justify-center items-center h-screen">
            <span className="text-red-400 text-xl">Developer not found.</span>
          </div>
        </div>
  
    </Layout>
  );
  }

  // Example stats
  const totalDownloads = games.reduce((sum, g) => sum + (g.downloads || 0), 0);
  const avgRating = games.length
    ? (games.reduce((sum, g) => sum + (g.rating || 0), 0) / games.length).toFixed(2)
    : 'N/A';

  return (
    <Layout>
      
      <div className="min-h-screen bg-black text-green-400 font-mono">
        
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Back Button */}
            <Link to="/developer" className="inline-flex items-center text-cyan-400 hover:text-green-400 mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
               BACK_TO_DEVELOPERS
            </Link>

            {/* Developer Header */}
            <div className="relative mb-12">
              {/* No cover image in schema, so use a placeholder */}
              <div className="w-full h-48 object-cover rounded-lg border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 to-black" />
              <div className="absolute inset-0 bg-black/50 rounded-lg" />
              <div className="absolute bottom-6 left-6 flex items-end space-x-6">
                {/* No avatar in schema, so use a placeholder */}
                <div className="w-24 h-24 rounded-lg border-2 border-cyan-400 bg-gray-900 flex items-center justify-center text-3xl overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username || 'Developer'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Users className={`w-12 h-12 text-cyan-400 ${profile.avatar_url ? 'hidden' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold text-cyan-400 mb-1 neon-text">
                      {profile.username || profile.wallet_address}
                    </h1>
                    {profile.is_verified && (
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-green-400 mb-2">{profile.bio || "No bio provided."}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>N/A</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Sidebar */}
              <div className="space-y-6">
                {/* Bio */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">BIO</h3>
                  <p className="text-green-400 text-sm leading-relaxed">
                    {profile.bio || "No bio provided."}
                  </p>
                </Card>

                {/* Stats */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">STATS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-400">GAMES</span>
                      <span className="text-cyan-400 font-bold">{games.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">DOWNLOADS</span>
                      <span className="text-cyan-400 font-bold">{totalDownloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">AVG RATING</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-cyan-400 font-bold">{avgRating}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Links */}
                {/* If you add website/twitter/github to profiles, render here */}
                <Card className="bg-black border-cyan-400 border-2 p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">LINKS</h3>
                  <div className="space-y-3">
                    {profile.website && (
                      <Button asChild variant="outline" className="w-full justify-start border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                        <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 mr-2" />
                          WEBSITE
                        </a>
                      </Button>
                    )}
                    {profile.social_links?.twitter && (
                      <Button asChild variant="outline" className="w-full justify-start border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                        <a href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4 mr-2" />
                          TWITTER
                        </a>
                      </Button>
                    )}
                    {profile.social_links?.github && (
                      <Button asChild variant="outline" className="w-full justify-start border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                        <a href={`https://github.com/${profile.social_links.github}`} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          GITHUB
                        </a>
                      </Button>
                    )}
                    {!profile.website && !profile.social_links?.twitter && !profile.social_links?.github && (
                      <p className="text-center text-gray-400 text-sm py-2">No links available</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-cyan-400 neon-text">
                     PUBLISHED_GAMES 
                  </h2>
                  {/* You can add a follow button if you implement followers */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {games.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 px-6 text-center">
                      <GamepadIcon className="w-16 h-16 text-cyan-400 mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-cyan-400 mb-2">No Games Published Yet</h3>
                      <p className="text-green-400 max-w-md">This developer hasn't published any games yet. Check back later!</p>
                    </div>
                  ) : null}
                  {games.map((game) => (
                    <Card key={game.game_id} className="bg-black border-cyan-400 border-2 overflow-hidden hover:border-green-400 transition-colors group">
                      <div className="relative">
                        {/* No image in schema, so use a placeholder */}
                        <div className="w-full h-32 bg-gradient-to-br from-cyan-900/50 to-black flex items-center justify-center text-cyan-400 text-xl relative overflow-hidden">
                          <GamepadIcon className="w-12 h-12 opacity-30" />
                          {game.thumbnail_url ? (
                            <img 
                              src={game.thumbnail_url} 
                              alt={game.title} 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-purple-500 text-white font-mono">
                            {game.category || "N/A"}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-cyan-400 mb-2 tracking-wider truncate" title={game.title}>
                          {game.title}
                        </h3>
                        
                        <p className="text-sm text-green-400 mb-4 line-clamp-2">
                          {game.description}
                        </p>

                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">{game.downloads?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-cyan-400">{game.rating || "N/A"}</span>
                          </div>
                        </div>

                        <Button size="sm" className="w-full bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                          <GamepadIcon className="w-4 h-4 mr-2" />
                          PLAY_GAME
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default DeveloperProfile;