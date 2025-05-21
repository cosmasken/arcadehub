import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAAWallet } from "@/hooks/useAAWallet";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useProfileStore from "@/stores/use-profile";
import { ethers } from 'ethers';
import { mintNFT as contractMintNFT } from '@/lib/contractUtils';

interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
}

const AchievementMinting = () => {
  const { toast } = useToast();
  const { aaWallet, aaSigner, isLoading } = useAAWallet();
  const { achievements } = useProfileStore();
  const currentAchievements = achievements as number; // Type assertion for achievements
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Type assertion for mock achievements
  const mockAchievements: Achievement[] = [
    { id: 1, name: "Master Gamer", description: "Played 100 games", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
    { id: 2, name: "Speed Demon", description: "Completed 50 racing games", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
    { id: 3, name: "Puzzle Master", description: "Solved 250 puzzles", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
    { id: 4, name: "Arcade Legend", description: "Reached level 100 in all games", image: "https://images.unsplash.com/photo-1614032686099-e648d6dea9b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
  ];

  // Check if wallet is connected
  const isWalletConnected = aaSigner !== undefined;


  interface AchievementMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  }

  const getAchievementMetadata = (achievement: Achievement): AchievementMetadata => {
    return {
      name: achievement.name,
      description: achievement.description,
      image: achievement.image,
      attributes: [
        {
          trait_type: "Type",
          value: "Achievement",
        },
        {
          trait_type: "Category",
          value: achievement.name.toLowerCase().includes('puzzle') ? 'Puzzle' : achievement.name.toLowerCase().includes('speed') ? 'Racing' : 'General',
        },
      ],
    };
  };

  const handleMint = async () => {
    if (!isWalletConnected || !selectedAchievement || !aaWallet) {
      setError("Please connect your wallet and select an achievement");
      return;
    }

    setIsMinting(true);
    setError(null);
    setTxHash(null);

    try {
      const selectedAchievementData = mockAchievements.find((a: Achievement) => a.id === selectedAchievement);
      if (!selectedAchievementData) {
        throw new Error("Achievement not found");
      }

      // Create achievement metadata
      const metadata = getAchievementMetadata(selectedAchievementData);
      const encodedMetadata = Buffer.from(JSON.stringify(metadata)).toString('base64');

      // Mint the NFT
      const result = await contractMintNFT(aaSigner, aaWallet, encodedMetadata);

      setTxHash(result.transactionHash);
      toast({
        title: "Success!",
        description: "Your achievement has been minted as an NFT!",
      });
      
      // Update user's achievements count
      useProfileStore.setState({ achievements: currentAchievements + 1 });
    } catch (error: Error | unknown) {
      console.error("Error minting achievement:", error);
      setError(error instanceof Error ? error.message : "Failed to mint achievement");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint achievement",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gradient">Mint Your Achievements</h1>
        <p className="text-muted-foreground mb-8">
          Turn your gaming achievements into valuable NFTs that you can showcase and trade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockAchievements.map(achievement => (
            <Card 
              key={achievement.id}
              className={cn(
                "arcade-card cursor-pointer transition-all duration-300 hover:scale-105",
                selectedAchievement === achievement.id && "border-2 border-arcade-purple"
              )}
              onClick={() => setSelectedAchievement(achievement.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-arcade-yellow" />
                  <div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="arcade-card">
          <CardHeader>
            <CardTitle>Mint Selected Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-arcade-yellow" />
                <div>
                  <h3 className="font-medium">{mockAchievements.find(a => a.id === selectedAchievement)?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mockAchievements.find(a => a.id === selectedAchievement)?.description}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                  {error}
                </div>
              )}

              {txHash && (
                <div className="bg-success/10 text-success text-sm rounded-md p-3">
                  <p>Transaction successful!</p>
                  <a
                    href={`https://testnet.neroscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-success/80"
                  >
                    View on NeroScan
                  </a>
                </div>
              )}

              <Button
                onClick={handleMint}
                disabled={isLoading || isMinting || !selectedAchievement || !isWalletConnected}
                className="w-full"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting...
                  </>
                ) : aaWallet ? (
                  "Mint Achievement"
                ) : (
                  "Connect Wallet First"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementMinting;
