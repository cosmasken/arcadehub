import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Trophy,
  Star,
  Plus,
  GamepadIcon,
  Sparkles,
  Coins,
} from 'lucide-react';
import MintingModal from '../components/MintingModal';
import LoadingModal from '../components/LoadingModal';
import TokenClaimModal from '../components/TokenClaimModal';
import { useGameState } from '../hooks/useGameState';
import { achievements as achievementsMap } from '../data/achievements';
import { shopItems } from '../data/shopItems';
import supabase from '../hooks/use-supabase';
import { useWalletStore } from '../stores/useWalletStore';
import { submitTournamentScoreAA } from '../lib/aaUtils'; // Import AA utility
import { useToast } from '../hooks/use-toast'; // Assuming a toast hook for notifications

const achievements = Object.values(achievementsMap);

const HoneyClicker = () => {
  const {
    points: honey,
    clickMultiplier: honeyPerClick,
    pointsPerSecond: honeyPerSecond,
    totalClicks,
    ownedItems,
    addPoints,
    buyItem,
    canAfford,
    canClaim,
    claimPoints,
  } = useGameState();

  const { aaWalletAddress,aaSigner } = useWalletStore();
  const { toast } = useToast();

  const claimableTokens = Math.floor(honey / 10000);
  const honeyToSpend = claimableTokens * 10000;

  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<unknown>(null);

  // Sync isPaused with component lifecycle
  useEffect(() => {
    setIsPaused(false); // Game is active when mounted
    return () => setIsPaused(true); // Game is paused when unmounted
  }, []);
  const [mintedAchievements, setMintedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('honeyClickerMintedAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Tournament state
  const [joinedTournaments, setJoinedTournaments] = useState<number[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<number, boolean>>({});

  // Pause passive income when tab is not in view
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        if (!gameStartTime) setGameStartTime(new Date());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStartTime]);

  // Check achievement unlocks
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (!achievement.id || unlockedAchievements[achievement.id]) return;
      let shouldUnlock = false;
      if (achievement.requirement) shouldUnlock = honey >= achievement.requirement;
      if (achievement.clicksRequired) shouldUnlock = totalClicks >= achievement.clicksRequired;
      if (achievement.purchasesRequired) shouldUnlock = Object.values(ownedItems).reduce((sum, count) => sum + count, 0) >= achievement.purchasesRequired;
      if (shouldUnlock) {
        setUnlockedAchievements((prev) => ({ ...prev, [achievement.id!]: true }));
      }
    });
  }, [honey, totalClicks, ownedItems, unlockedAchievements]);

  const handleClick = () => addPoints(honeyPerClick);
  const handleBuy = (item: typeof shopItems[0]) => buyItem(item.id);

  const saveGameSession = async (endReason: string) => {
    if (!aaWalletAddress || !gameStartTime) return;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - gameStartTime.getTime()) / 1000);
    await supabase.from('game_plays').insert([
      {
        game_id: "honey-clicker",
        player_wallet: aaWalletAddress,
        played_at: endTime.toISOString(),
        session_duration: duration,
        score: Math.floor(honey),
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        unique_session_id: `${aaWalletAddress}-${endTime.getTime()}`,
        end_reason: endReason,
      },
    ]);
  };

  // Submit score to tournament
  const handleSubmitScore = async (tournamentId: number) => {
    if (!aaSigner) {
      toast({ title: "Wallet Error", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }
    try {
      // In a real implementation, the signature should come from a server
      const signature = '0x'; // Placeholder: Replace with server-side signature generation
      await submitTournamentScoreAA(
        aaSigner, // Assuming aaWalletAddress is an ethers.Signer in a real setup
        tournamentId,
        Math.floor(honey),
        signature
      );
      toast({ title: "Score Submitted", description: `Score ${Math.floor(honey)} submitted to Tournament #${tournamentId}.` });
    } catch (err) {
      console.error('Score submission error:', err);
      toast({ title: "Submission Failed", description: "Failed to submit score.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <Header />
      <TokenClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claimableTokens={claimableTokens}
        honeyToSpend={honeyToSpend}
        onClaim={() => {
          claimPoints(honeyToSpend);
          setIsClaimModalOpen(false);
        }}
      />
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
               HONEY_CLICKER 
            </h1>
            <p className="text-green-400 text-lg tracking-wider">
              CLICK TO EARN SWEET HONEY
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {claimableTokens > 0 && (
                <Card className="bg-yellow-400/10 border-yellow-400 border-2 p-6 mb-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400 neon-text">
                          TOKEN CLAIM AVAILABLE!
                        </h3>
                        <p className="text-green-400">
                          Convert {honeyToSpend.toLocaleString()} honey → {claimableTokens} HIVE tokens
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsClaimModalOpen(true)}
                      className="bg-yellow-400 text-black hover:bg-yellow-300 font-mono font-bold"
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      CLAIM {claimableTokens} TOKENS
                    </Button>
                  </div>
                </Card>
              )}
              <Card className="bg-black border-cyan-400 border-2 p-8 text-center mb-6">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🍯</div>
                  <h2 className="text-4xl font-bold text-yellow-400 mb-2">
                    {Math.floor(honey).toLocaleString()} HONEY
                  </h2>
                  <p className="text-green-400">
                    {honeyPerClick}/CLICK | {honeyPerSecond}/SEC
                  </p>
                </div>
                <Button
                  onClick={handleClick}
                  className="h-24 w-24 md:w-64 md:h-64 rounded-full bg-yellow-400 text-black hover:bg-yellow-300 text-6xl transition-transform hover:scale-105 active:scale-95"
                >
                  🐝
                </Button>
                <div className="mt-6">
                  <p className="text-cyan-400">TOTAL CLICKS: {totalClicks.toLocaleString()}</p>
                </div>
              </Card>

              {/* Achievements */}
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-cyan-400"> ACHIEVEMENTS</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {achievements.map((achievement) => {
                    if (!achievement.id) return null;
                    const unlocked = unlockedAchievements[achievement.id];
                    const minted = mintedAchievements.includes(achievement.id.toString());
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 border ${unlocked ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600'}`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">{achievement.emoji}</span>
                          <span className={`font-bold text-sm ${unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {achievement.title}
                          </span>
                        </div>
                        <p className="text-xs text-green-400">{achievement.description}</p>
                        {unlocked && !minted && (
                          <Button
                            size="sm"
                            className="mt-2 bg-green-400 text-black hover:bg-cyan-400"
                            onClick={() => {
                              setSelectedAchievement(achievement);
                              setIsMintingModalOpen(true);
                            }}
                          >
                            Mint Achievement
                          </Button>
                        )}
                        {minted && (
                          <span className="mt-2 inline-block text-xs text-green-400">Minted</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Tournament Section */}
              <Card className="bg-black border-cyan-400 border-2 p-6 mt-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4"> TOURNAMENTS</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-green-400">Join a Tournament</h4>
                    <Button
                      onClick={() => setJoinedTournaments([...joinedTournaments, 1])}
                      className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
                    >
                      Join Tournament #1
                    </Button>
                  </div>
                  {joinedTournaments.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-green-400">Submit Score</h4>
                      <Button
                        onClick={() => handleSubmitScore(0)}
                        className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
                      >
                        Submit Score to Tournament #1
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Shop */}
            <div>
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <GamepadIcon className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-cyan-400"> UPGRADES_SHOP</h3>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {shopItems.map((item) => {
                    const owned = ownedItems[item.id] || 0;
                    const affordable = canAfford(item.id);
                    return (
                      <div key={item.id} className="border border-green-400 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-cyan-400 text-sm">{item.name}</h4>
                            <p className="text-xs text-green-400">
                              +{item.clickMultiplier ? item.clickMultiplier : item.passiveIncome} {item.clickMultiplier ? 'PER CLICK' : 'PER SEC'}
                            </p>
                          </div>
                          {owned > 0 && (
                            <Badge className="bg-green-400 text-black text-xs">{owned}</Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-bold text-sm">{item.baseCost} HONEY</span>
                          <Button
                            size="sm"
                            onClick={() => handleBuy(item)}
                            disabled={!affordable}
                            className={`font-mono text-xs ${affordable ? 'bg-green-400 text-black hover:bg-cyan-400' : 'bg-gray-600 text-gray-400'}`}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            BUY
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {isMintingModalOpen && selectedAchievement && (
        <MintingModal
          isOpen={isMintingModalOpen}
          onClose={() => setIsMintingModalOpen(false)}
          achievement={selectedAchievement}
          setIsLoadingModalOpen={setIsLoadingModalOpen}
          onMintSuccess={async (achievement, txHash) => {
            setIsMintingModalOpen(false);
            if (!aaWalletAddress) return;
            await supabase.from('user_achievements').insert([
              {
                user_wallet: aaWalletAddress,
                achievement_id: achievement.id,
                unlocked: true,
                unlocked_at: new Date().toISOString(),
                tx_hash: txHash,
              },
            ]);
          }}
        />
      )}
      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="MINTING NFT"
        description="Please wait while we mint your NFT..."
      />
    </div>
  );
};

export default HoneyClicker;