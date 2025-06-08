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
    claimPoints
  } = useGameState();

  const { aaWalletAddress } = useWalletStore();

  const claimableTokens = Math.floor(honey / 10000);
  const honeyToSpend = claimableTokens * 10000;

  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);

  // Calculate total purchases for achievements
  const totalPurchases = Object.values(ownedItems).reduce((sum, count) => sum + count, 0);

  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const [selectedAchievement, setSelectedAchievement] = useState<unknown>(null);
  const [mintedAchievements, setMintedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('honeyClickerMintedAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  // For pause/save/reset
  const [isPaused, setIsPaused] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // For tracking game start time
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  // For tracking claimed tokens
  const [claimedTokens, setClaimedTokens] = useState(0);


  const saveGameToDb = async () => {
    if (!aaWalletAddress) return;
    const saveData = {
      points: honey,
      totalClicks,
      clickMultiplier: honeyPerClick,
      pointsPerSecond: honeyPerSecond,
      ownedItems,
    };
    await supabase.from("game_saves").insert([
      {
        user_wallet: aaWalletAddress,
        game_id: "honey-clicker",
        save_data: saveData,
        updated_at: new Date().toISOString(),
      }
    ]);
  };

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
      }
    ]);
  };



  // Track unlocked achievements by id
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<number, boolean>>({});

  // Check achievements unlocks
  useEffect(() => {
    achievements.forEach(achievement => {
      if (!achievement.id) return;
      if (!unlockedAchievements[achievement.id]) {
        let shouldUnlock = false;
        // Honey-based
        if (achievement.requirement) {
          shouldUnlock = honey >= achievement.requirement;
        }
        // Click-based
        if (achievement.clicksRequired) {
          shouldUnlock = totalClicks >= achievement.clicksRequired;
        }
        // Purchase-based
        if (achievement.purchasesRequired) {
          shouldUnlock = totalPurchases >= achievement.purchasesRequired;
        }
        if (shouldUnlock) {
          setUnlockedAchievements(prev => ({ ...prev, [achievement.id!]: true }));
        }
      }
    });
  }, [honey, totalClicks, totalPurchases, unlockedAchievements]);

  // Click handler
  const handleClick = () => {
    addPoints(honeyPerClick);
  };

  // Shop buy handler
  const handleBuy = (item: typeof shopItems[0]) => {
    buyItem(item.id);
  };

  const handlePauseGame = () => {
    setIsPaused(true);
    saveGameSession('Paused');
  };

  const handleResumeGame = () => {
    setIsPaused(false);
    setGameStartTime(new Date());
  };

  const handleSaveGame = async () => {
    setShowSaveModal(true);
    setIsPaused(false);
    await saveGameSession('Manual Save');
    await saveGameToDb();
  };

  const handleResetGame = async () => {
    await saveGameSession('Game Reset');
    localStorage.removeItem('honeyClickerSave');
    window.location.reload();
  };

  return (
    <>
        <div className="min-h-screen bg-black text-green-400 font-mono scanlines">
          <Header />
          <TokenClaimModal
            isOpen={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            claimableTokens={claimableTokens}
            honeyToSpend={honeyToSpend}
            onClaim={() => {
              claimPoints(honeyToSpend); // Deduct honey locally
              setIsClaimModalOpen(false); // Optionally close the modal
            }}
          />
          <div className="pt-24 pb-16 px-6">
            <div className="container mx-auto max-w-7xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
                  &gt; HONEY_CLICKER &lt;
                </h1>
                <p className="text-green-400 text-lg tracking-wider">
                  CLICK TO EARN SWEET HONEY
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Game Area */}
                <div className="lg:col-span-2">
                  {/* Token Claim Panel */}
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
                    <div className="mb-6">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-cyan-400 mb-1">
                          Click to earn honey!
                        </span>
                        <span className="text-xs text-green-400 md:text-sm">
                          Tap the bee to collect more 🍯
                        </span>
                      </div>
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
                      <h3 className="text-xl font-bold text-cyan-400">&gt; ACHIEVEMENTS</h3>
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
                              <span className={`text-2xl`}>{achievement.emoji}</span>
                              <span className={`font-bold text-sm ${unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                                {achievement.title}
                              </span>
                            </div>
                            <p className="text-xs text-green-400">{achievement.description}</p>
                            {/* Mint Button */}
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
                </div>

                {/* Shop */}
                <div>
                  <Card className="bg-black border-cyan-400 border-2 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <GamepadIcon className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-xl font-bold text-cyan-400">&gt; UPGRADES_SHOP</h3>
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
                                <Badge className="bg-green-400 text-black text-xs">
                                  {owned}
                                </Badge>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-yellow-400 font-bold text-sm">
                                {item.baseCost} HONEY
                              </span>
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
              }
            ]);
          }}
        />
      )}

      <LoadingModal
        isOpen={isLoadingModalOpen}
        title="MINTING NFT"
        description="Please wait while we mint your NFT..."
      />
    </>
  );
};

export default HoneyClicker;