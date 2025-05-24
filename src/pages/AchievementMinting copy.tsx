import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWalletStore } from "@/stores/useWalletStore";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
  isMinted: boolean;
  minting: boolean;
}

interface MintParams {
  recipientAddress: string;
  gasMultiplier: number;
  customMessage: string;
}

const achievements: Achievement[] = [
  {
    id: 1,
    name: "First Achievement",
    description: "Complete your first game",
    image: "achievement-1.png",
    isMinted: false,
    minting: false
  },
  {
    id: 2,
    name: "Game Master",
    description: "Win 10 games in a row",
    image: "achievement-2.png",
    isMinted: false,
    minting: false
  },
  {
    id: 3,
    name: "Daily Player",
    description: "Play every day for a week",
    image: "achievement-3.png",
    isMinted: false,
    minting: false
  }
];

const AchievementMinting = () => {
  const { walletState, aaWalletAddress } = useWalletStore();
  const [localAchievements, setLocalAchievements] = useState(achievements);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [mintParams, setMintParams] = useState<MintParams>({
    recipientAddress: aaWalletAddress || '',
    gasMultiplier: 100,
    customMessage: ''
  });
  const [transactionHash, setTransactionHash] = useState<string>("");

  const handleMint = async (achievementId: number) => {
    if (!aaWalletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    const achievementIndex = localAchievements.findIndex(a => a.id === achievementId);
    if (achievementIndex === -1) return;

    setSelectedAchievement(localAchievements[achievementIndex]);
    setIsMintModalOpen(true);
  };

  const handleMintConfirm = async () => {
    if (!selectedAchievement) return;

    const achievementIndex = localAchievements.findIndex(a => a.id === selectedAchievement.id);
    if (achievementIndex === -1) return;

    // Update UI state
    const updatedAchievements = [...localAchievements];
    updatedAchievements[achievementIndex] = {
      ...updatedAchievements[achievementIndex],
      minting: true
    };
    setLocalAchievements(updatedAchievements);

    try {
      // Simulate minting process
      // TODO: Replace with actual minting logic
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 10)}`;
      setTransactionHash(mockTxHash);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate minting delay

      // Update achievement state
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        minting: false,
        isMinted: true
      };
      setLocalAchievements(updatedAchievements);

      toast.success(`Successfully minted ${selectedAchievement.name} achievement!`);
      setIsMintModalOpen(false);
      setSelectedAchievement(null);
    } catch (error) {
      console.error('Minting failed:', error);
      updatedAchievements[achievementIndex] = {
        ...updatedAchievements[achievementIndex],
        minting: false
      };
      setLocalAchievements(updatedAchievements);
      toast.error("Failed to mint achievement");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Achievement Minting</h1>
              <p className="text-muted-foreground">View and mint your achievements</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localAchievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <img 
                          src={achievement.image} 
                          alt={achievement.name} 
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <h3 className="font-semibold mb-2">{achievement.name}</h3>
                      <p className="text-muted-foreground">{achievement.description}</p>
                      
                      {achievement.isMinted ? (
                        <div className="mt-4 bg-green-100 text-green-800 p-2 rounded">
                          <Trophy className="inline h-4 w-4 mr-2" />
                          Minted Successfully
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleMint(achievement.id)}
                          disabled={achievement.minting || !walletState.isConnected}
                          className="mt-4 w-full"
                        >
                          {achievement.minting ? (
                            <>
                              <Trophy className="animate-spin mr-2 h-4 w-4" />
                              Minting...
                            </>
                          ) : (
                            <>
                              <Trophy className="mr-2 h-4 w-4" />
                              Mint Achievement
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Minting Modal */}
      <Dialog open={isMintModalOpen} onOpenChange={setIsMintModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Mint Achievement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedAchievement?.minting ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Trophy className="animate-spin h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold">Minting in progress...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments. Please don't close this window.
                  </p>
                </div>
                {transactionHash && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transaction Hash:</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(transactionHash)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-600 truncate">
                        {transactionHash}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">{transactionHash.length}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={mintParams.recipientAddress}
                    onChange={(e) => setMintParams(prev => ({ ...prev, recipientAddress: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter recipient address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Gas Multiplier
                  </label>
                  <input
                    type="number"
                    value={mintParams.gasMultiplier}
                    onChange={(e) => setMintParams(prev => ({ ...prev, gasMultiplier: Number(e.target.value) }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter gas multiplier (100 = 100%)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Custom Message
                  </label>
                  <input
                    type="text"
                    value={mintParams.customMessage}
                    onChange={(e) => setMintParams(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Optional custom message"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            {!selectedAchievement?.minting && (
              <>
                <Button variant="outline" onClick={() => setIsMintModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMintConfirm} disabled={selectedAchievement?.minting}>
                  <Trophy className="mr-2 h-4 w-4" />
                  Mint Achievement
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementMinting;
