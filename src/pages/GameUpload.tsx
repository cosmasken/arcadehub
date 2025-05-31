import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Upload, Loader } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { submitGameAA } from '../utils/aaUtils';
import { useWalletStore } from "../stores/useWalletStore";
import { usePinata } from "../hooks/use-pinata";
import supabase  from "../hooks/use-supabase";
import { ethers } from 'ethers';

const GameUpload = () => {
  const { aaSigner, aaWalletAddress } = useWalletStore();
  const { error, uploadFile } = usePinata();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    assets: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

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

  if (!formData.title || !formData.description || !formData.category || !formData.assets) {
    toast({
      title: "Missing Fields",
      description: "Please fill in all required fields and upload game assets.",
      variant: "destructive"
    });
    return;
  }

  setIsUploading(true);

  // 1. Upload to Pinata
  const hash = await uploadFile(formData.assets);
  if (!hash) {
    toast({
      title: "Upload Failed",
      description: error || "There was an error uploading your game assets to IPFS.",
      variant: "destructive"
    });
    setIsUploading(false);
    return;
  }

  toast({
    title: "Game Assets Uploaded",
    description: `IPFS Hash: ${hash}`,
  });

  // 2. Generate a unique gameId (UUID or hash)
  // Option 1: UUID
  // const gameId = crypto.randomUUID();

  // Option 2: keccak256 hash (more "blockchain style")
  const gameId = ethers.keccak256(
    ethers.toUtf8Bytes(Date.now() + Math.random().toString())
  );

  // 3. Register on-chain via AA wallet
  if (!aaSigner) {
    toast({
      title: "Wallet Not Connected",
      description: "Connect your wallet to register your game on-chain.",
      variant: "destructive",
    });
    setIsUploading(false);
    return;
  }

  try {
    // Pass gameId, title, hash to contract
    const result = await submitGameAA(aaSigner, gameId, formData.title, hash, 0);
    console.log("resultttttttttttttttttttttttt is", result);
    // if (!result || !result.gameId) {
    //   toast({ title: "On-chain Registration Failed", description: "Could not submit game on-chain.", variant: "destructive" });
    //   setIsUploading(false);
    //   return;
    // }

    // 4. Save to Supabase
    await supabase.from('games').insert([{
      game_id: gameId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ipfs_hash: hash,
      developer: aaWalletAddress,
    }]);

    toast({
      title: "Game Registered",
      description: "Your game is now pending review by the community!",
    });

    // Optionally reset form here
    setFormData({
      title: '',
      description: '',
      category: '',
      assets: null
    });
    const fileInput = document.getElementById('assets') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  } catch (err: any) {
    toast({
      title: "On-chain Registration Failed",
      description: err.message || "Failed to register game on-chain.",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Game</h1>
          <p className="text-blue-300">Share your game with the community</p>
        </div>

        <Card className="bg-blue-900/30 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Game Details
            </CardTitle>
          </CardHeader>
          <CardContent>
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

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="assets" className="text-white">Game Assets *</Label>
                <div className="border-2 border-dashed border-blue-700/50 rounded-lg p-6 text-center">
                  <input
                    id="assets"
                    type="file"
                    onChange={handleFileChange}
                    accept=".zip,.rar,.7z"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="assets"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-blue-400" />
                    <span className="text-blue-300">
                      {formData.assets ? formData.assets.name : "Click to upload game assets"}
                    </span>
                    <span className="text-sm text-blue-400">
                      Supported formats: ZIP, RAR, 7Z
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameUpload;