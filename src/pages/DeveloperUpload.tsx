import Layout from "../components/Layout";

import React, { useState,useEffect } from 'react';
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
import { Developer, GameFormData } from '../types/developerUpload';
import { usePinata } from '../hooks/use-pinata';
import supabase from '../hooks/use-supabase';
import { submitGameAA } from '../lib/aaUtils';
import useWalletStore from '../stores/useWalletStore';
import { toast } from '../components/ui/use-toast';
import { ethers } from 'ethers';
import LoadingModal from '../components/LoadingModal';
import { truncateAddress } from '../lib/utils';

const DeveloperUpload = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const { aaSigner, aaWalletAddress } = useWalletStore();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const { error, uploadFile } = usePinata();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    category: '',
    thumbnail: null,
    assets: null
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, wallet_address, username, bio")
        .eq("user_type", "developer");
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
        0 // paymentType: 0 for sponsored
      );

      // 5. Save to database
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during upload or registration.";
      toast({
        title: "Upload or Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsLoadingModalOpen(false);
    }
  };
  const featuredDevelopers = [
    {
      id: "1",
      name: "CYBER_STUDIO",
      username: "@cyberstudio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
      bio: "Leading the charge in cyberpunk game development.",
      games: 8,
      downloads: 156743,
      rating: 4.8,
      featured: true
    },
    {
      id: "2",
      name: "PIXEL_FORGE",
      username: "@pixelforge",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      wallet_address: "0xabcdef1234567890abcdef1234567890abcdef12",
      bio: "Crafting nostalgic pixel art adventures.",
      games: 12,
      downloads: 234567,
      rating: 4.9,
      featured: true
    },
    {
      id: "3",
      name: "NEON_LABS",
      username: "@neonlabs",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      wallet_address: "0x1234abcdef1234567890abcdef1234567890ab",
      bio: "Innovating with vibrant, high-energy game experiences.",
      games: 5,
      downloads: 89432,
      rating: 4.7,
      featured: false
    },
    {
      id: "4",
      name: "RETRO_WORKS",
      username: "@retroworks",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      wallet_address: "0xabcdef1234abcdef1234567890abcdef123456",
      bio: "Dedicated to bringing classic arcade vibes to the blockchain.",
      games: 15,
      downloads: 345612,
      rating: 4.8,
      featured: false
    }
  ];

  const renderUploadForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Game Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-cyan-400 mb-2 block">
          Game Title
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter game title"
          className="bg-black border-cyan-400 text-white"
          required
        />
      </div>

      {/* Game Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-cyan-400 mb-2 block">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your game..."
          className="bg-black border-cyan-400 text-white min-h-[120px]"
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-cyan-400 mb-2 block">
          Category
        </Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full p-2 bg-black border border-cyan-400 text-white rounded"
          required
        >
          <option value="">Select a category</option>
          <option value="action">Action</option>
          <option value="adventure">Adventure</option>
          <option value="puzzle">Puzzle</option>
          <option value="strategy">Strategy</option>
          <option value="rpg">RPG</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Game Asset Upload */}
      <div className="space-y-2">
        <Label className="text-cyan-400 mb-2 block">
          Game Assets (ZIP file)
        </Label>
        <input
          type="file"
          id="assets"
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
          required
        />
        <label
          htmlFor="assets"
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-cyan-400 rounded-lg cursor-pointer hover:bg-gray-900/50 transition-colors text-center"
        >
          <Upload className="w-8 h-8 text-blue-400" />
          <span className="text-blue-300">
            {formData.assets ? formData.assets.name : "Click to upload game assets (.zip)"}
          </span>
          <span className="text-sm text-blue-400">
            Supported format: ZIP (max 100MB)
          </span>
        </label>
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label className="text-cyan-400 mb-2 block">
          Thumbnail Image
        </Label>
        <input
          type="file"
          id="thumbnail"
          accept="image/png, image/jpeg"
          onChange={handleThumbnailChange}
          className="hidden"
          required
        />
        <label
          htmlFor="thumbnail"
          className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-cyan-400 rounded-lg cursor-pointer hover:bg-gray-900/50 transition-colors text-center"
        >
          <Upload className="w-8 h-8 text-blue-400" />
          <span className="text-blue-300">
            {formData.thumbnail ? formData.thumbnail.name : "Click to upload thumbnail (.png, .jpg)"}
          </span>
          <span className="text-sm text-blue-400">
            Supported formats: PNG, JPG (max 5MB)
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isUploading}
        className="w-full bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs"
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
            <div className="bg-black border-cyan-400 border-2 p-6 hover:border-green-400 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${developer.avatar}`}
                    alt={developer.name}
                    className="w-20 h-20 rounded-lg border-2 border-cyan-400 group-hover:border-green-400 transition-colors"
                  />
                </div>

                <h3 className="text-lg font-bold text-cyan-400 mb-1 tracking-wider">
                  {developer.name}
                </h3>
                <p className="text-green-400 text-sm mb-4">
                  {truncateAddress(developer.wallet_address)}
                </p>

                <Button size="sm" className="w-full mt-4 bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                  VIEW_PROFILE
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Button
            variant={activeTab === 'upload' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upload')}
            className="mr-4"
          >
            Upload Game
          </Button>
          <Button
            variant={activeTab === 'developers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('developers')}
          >
            Browse Developers
          </Button>
        </div>

        {activeTab === 'upload' ? renderUploadForm() : renderDevelopers()}

        <LoadingModal
          isOpen={isLoadingModalOpen}
          title="Processing..."
          description={isUploading ? "Uploading files to IPFS..." : "Registering your game..."}
        />
      </div>
    </Layout>
  );
};

export default DeveloperUpload;
