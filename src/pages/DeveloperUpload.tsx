
import React, { useState,useEffect } from 'react';
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
  Loader,
  Download,
  GamepadIcon,
  Trophy,
  Github,
  Twitter,
  Globe
} from 'lucide-react';
import { usePinata } from '../hooks/use-pinata';
import supabase from '../hooks/use-supabase';
import { submitGameAA } from '../lib/aaUtils';
import useWalletStore from '../stores/useWalletStore';
import { toast } from '../hooks/use-toast';
import { ethers } from 'ethers';
import LoadingModal from '../components/LoadingModal';
import { truncateAddress } from '../lib/utils';

const DeveloperUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const { aaSigner, aaWalletAddress } = useWalletStore();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const { error, uploadFile } = usePinata();
  const [developers, setDevelopers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: null as File | null,
    assets: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
  const fetchDevelopers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, wallet_address, username, bio")
      .eq("role", "developer");
    if (!error) setDevelopers(data || []);
  };
  fetchDevelopers();
}, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, assets: file }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.assets || !formData.thumbnail) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields and upload game assets and a thumbnail.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingModalOpen(true);
    setIsUploading(true);

    try {
      // 1. Upload game asset to Pinata
      const assetHash = await uploadFile(formData.assets);
      if (!assetHash) throw new Error(error || "Failed to upload game asset to IPFS.");

      // 2. Upload thumbnail to Pinata
      const thumbnailHash = await uploadFile(formData.thumbnail);
      if (!thumbnailHash) throw new Error(error || "Failed to upload thumbnail to IPFS.");

      toast({
        title: "Files Uploaded",
        description: `Assets and thumbnail uploaded to IPFS.`,
      });

      // 3. Generate a unique gameId
      const gameId = ethers.keccak256(
        ethers.toUtf8Bytes(Date.now() + Math.random().toString())
      );

      // 4. Register on-chain
      if (!aaSigner) throw new Error("Wallet not connected.");
      const result = await submitGameAA(
        aaSigner,
        gameId,
        formData.title,
        assetHash,
        0
      );

       await supabase.from('games').insert([{
          game_id: gameId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          ipfs_hash: assetHash,
          developer: aaWalletAddress,
          status: 'pending',
          thumbnail_ipfs_hash: thumbnailHash,
        }]);

      toast({
        title: "Game Registered",
        description: "Your game is now pending review by the community!",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        assets: null,
        thumbnail: null,
      });
      const assetInput = document.getElementById('assets') as HTMLInputElement;
      if (assetInput) assetInput.value = '';
      const thumbInput = document.getElementById('thumbnail') as HTMLInputElement;
      if (thumbInput) thumbInput.value = '';
    } catch (err: any) {
      toast({
        title: "Upload or Registration Failed",
        description: err.message || "An error occurred during upload or registration.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsLoadingModalOpen(false);
    }
  };
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Game Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter your game title"
          className="bg-blue-800/30 border-blue-700/50 text-white"
          disabled={isUploading}
        />
      </div>

      {/* Game Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your game..."
          rows={4}
          className="bg-blue-800/30 border-blue-700/50 text-white"
          disabled={isUploading}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-white">Category *</Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full py-2 px-3 bg-blue-800/30 border border-blue-700/50 rounded-md text-white"
          disabled={isUploading}
        >
          <option value="">Select a category</option>
          <option value="Strategy">Strategy</option>
          <option value="Adventure">Adventure</option>
          <option value="Puzzle">Puzzle</option>
          <option value="Action">Action</option>
          <option value="Simulation">Simulation</option>
          <option value="RPG">RPG</option>
        </select>
      </div>

      {/* Game Asset Upload */}
      <div className="space-y-2">
        <Label htmlFor="assets" className="text-white">Game Assets (ZIP) *</Label>
        <div className="border-2 border-dashed border-blue-700/50 rounded-lg p-6 text-center">
          <input
            id="assets"
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="assets"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-blue-400" />
            <span className="text-blue-300">
              {formData.assets ? formData.assets.name : "Click to upload game assets (.zip)"}
            </span>
            <span className="text-sm text-blue-400">
              Supported format: ZIP
            </span>
          </label>
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail" className="text-white">Thumbnail (PNG/JPG) *</Label>
        <div className="border-2 border-dashed border-blue-700/50 rounded-lg p-6 text-center">
          <input
            id="thumbnail"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleThumbnailChange}
            className="hidden"
            disabled={isUploading}
          />
          <label
            htmlFor="thumbnail"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-blue-400" />
            <span className="text-blue-300">
              {formData.thumbnail ? formData.thumbnail.name : "Click to upload thumbnail (.png, .jpg)"}
            </span>
            <span className="text-sm text-blue-400">
              Supported formats: PNG, JPG
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isUploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUploading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Game
          </>
        )}
      </Button>
    </form>
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, thumbnail: file }));
  };

  const renderDevelopers = () => (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-cyan-400 neon-text">
           FEATURED_DEVELOPERS 
        </h2>
        <p className="text-green-400 text-lg tracking-wider">
          TOP_GAME_CREATORS // INDIE_STUDIOS // BLOCKCHAIN_PIONEERS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {developers.map((developer) => (
          <Link key={developer.id} to={`/developer/profile/${developer.wallet_address}`}>
            <Card className="bg-black border-cyan-400 border-2 p-6 hover:border-green-400 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${developer.avatar}`}
                    alt={developer.name}
                    className="w-20 h-20 rounded-lg border-2 border-cyan-400 group-hover:border-green-400 transition-colors"
                  />
                  {/* {developer.featured && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-500 text-black p-1">
                        <Star className="w-3 h-3" />
                      </Badge>
                    </div>
                  )} */}
                </div>

                <h3 className="text-lg font-bold text-cyan-400 mb-1 tracking-wider">
                  {developer.name}
                </h3>
                <p className="text-green-400 text-sm mb-4">
                  {truncateAddress(developer.wallet_address)}
                  </p>
              {/* 
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
                </div> */}

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
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <Header />
      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="SENDING NFT"
        description="Please wait while your NFT is being sent as a gift..."
      />
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
               DEVELOPER_HUB 
            </h1>
            <p className="text-green-400 text-lg tracking-wider mb-8">
              UPLOAD_GAMES // EARN_CRYPTO // BUILD_COMMUNITY
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                onClick={() => setActiveTab('upload')}
                className={`font-mono ${activeTab === 'upload'
                    ? 'bg-cyan-400 text-black'
                    : 'bg-transparent text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black'
                  }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                UPLOAD_GAME
              </Button>
              <Button
                onClick={() => setActiveTab('developers')}
                className={`font-mono ${activeTab === 'developers'
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
