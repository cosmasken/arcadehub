
import React, { useState } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';
import { 
  Upload,
  User,
  Star,
  Download,
  GamepadIcon,
  Trophy,
  Github,
  Twitter,
  Globe
} from 'lucide-react';

const DeveloperUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');

  const featuredDevelopers = [
    {
      id: 1,
      name: "CYBER_STUDIO",
      username: "@cyberstudio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      games: 8,
      downloads: 156743,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: "PIXEL_FORGE",
      username: "@pixelforge",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      games: 12,
      downloads: 234567,
      rating: 4.9,
      featured: true
    },
    {
      id: 3,
      name: "NEON_LABS",
      username: "@neonlabs",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      games: 5,
      downloads: 89432,
      rating: 4.7,
      featured: false
    },
    {
      id: 4,
      name: "RETRO_WORKS",
      username: "@retroworks",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      games: 15,
      downloads: 345612,
      rating: 4.8,
      featured: false
    }
  ];

  const renderUploadForm = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-black border-cyan-400 border-2 p-8 text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 neon-text">
          &gt; UPLOAD_NEW_GAME &lt;
        </h2>
        
        <form className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-green-400 font-mono">GAME_TITLE</Label>
            <Input
              id="title"
              placeholder="Enter game title..."
              className="bg-black border-cyan-400 text-green-400 font-mono mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-green-400 font-mono">DESCRIPTION</Label>
            <Textarea
              id="description"
              placeholder="Describe your game..."
              className="bg-black border-cyan-400 text-green-400 font-mono mt-2 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-green-400 font-mono">CATEGORY</Label>
              <Input
                id="category"
                placeholder="e.g. ACTION, RPG..."
                className="bg-black border-cyan-400 text-green-400 font-mono mt-2"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-green-400 font-mono">PRICE_ETH</Label>
              <Input
                id="price"
                placeholder="0.05"
                className="bg-black border-cyan-400 text-green-400 font-mono mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gameFile" className="text-green-400 font-mono">GAME_FILE</Label>
            <div className="mt-2 border-2 border-dashed border-cyan-400 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
              <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400 font-mono">DRAG_AND_DROP_YOUR_GAME_FILE</p>
              <p className="text-green-400 text-sm mt-2">.ZIP, .RAR files supported</p>
              <Button className="mt-4 bg-cyan-400 text-black hover:bg-green-400 font-mono">
                BROWSE_FILES
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="thumbnail" className="text-green-400 font-mono">THUMBNAIL</Label>
            <div className="mt-2 border-2 border-dashed border-cyan-400 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-cyan-400 font-mono text-sm">UPLOAD_THUMBNAIL</p>
              <p className="text-green-400 text-xs mt-1">PNG, JPG (1920x1080 recommended)</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button className="flex-1 bg-cyan-400 text-black hover:bg-green-400 font-mono">
              &gt; UPLOAD_GAME
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
              SAVE_DRAFT
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderDevelopers = () => (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-cyan-400 neon-text">
          &gt; FEATURED_DEVELOPERS &lt;
        </h2>
        <p className="text-green-400 text-lg tracking-wider">
          TOP_GAME_CREATORS // INDIE_STUDIOS // BLOCKCHAIN_PIONEERS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredDevelopers.map((developer) => (
          <Link key={developer.id} to={`/developer/profile/${developer.id}`}>
            <Card className="bg-black border-cyan-400 border-2 p-6 hover:border-green-400 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={developer.avatar}
                    alt={developer.name}
                    className="w-20 h-20 rounded-lg border-2 border-cyan-400 group-hover:border-green-400 transition-colors"
                  />
                  {developer.featured && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-500 text-black p-1">
                        <Star className="w-3 h-3" />
                      </Badge>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-cyan-400 mb-1 tracking-wider">
                  {developer.name}
                </h3>
                <p className="text-green-400 text-sm mb-4">{developer.username}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-400">GAMES</span>
                    <span className="text-cyan-400 font-bold">{developer.games}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">DOWNLOADS</span>
                    <span className="text-cyan-400 font-bold">{developer.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">RATING</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-cyan-400 font-bold">{developer.rating}</span>
                    </div>
                  </div>
                </div>

                <Button size="sm" className="w-full mt-4 bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                  VIEW_PROFILE
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
      <div className="min-h-screen bg-black text-green-400 font-mono scanlines">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
                &gt; DEVELOPER_HUB &lt;
              </h1>
              <p className="text-green-400 text-lg tracking-wider mb-8">
                UPLOAD_GAMES // EARN_CRYPTO // BUILD_COMMUNITY
              </p>

              {/* Tab Navigation */}
              <div className="flex justify-center space-x-4 mb-8">
                <Button
                  onClick={() => setActiveTab('upload')}
                  className={`font-mono ${
                    activeTab === 'upload'
                      ? 'bg-cyan-400 text-black'
                      : 'bg-transparent text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black'
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  UPLOAD_GAME
                </Button>
                <Button
                  onClick={() => setActiveTab('developers')}
                  className={`font-mono ${
                    activeTab === 'developers'
                      ? 'bg-cyan-400 text-black'
                      : 'bg-transparent text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  DEVELOPERS
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'upload' ? renderUploadForm() : renderDevelopers()}
          </div>
        </div>
      </div>
  );
};

export default DeveloperUpload;
