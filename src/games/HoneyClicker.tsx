import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Share, History, Trophy, Settings as SettingsIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { useGameState } from "./hooks/useGameState";
import { shopItems } from "./data/shopItems";
import { ClickParticles } from "./components/ClickParticles";
import { LoadingScreen } from "./components/LoadingScreen";
import { GameModals } from "./components/GameModals";
import { AchievementsPanel } from "./components/AchievementsPanel";
import { HistoryModal } from "./components/HistoryModal";
import { TokenClaimModal } from "./components/TokenClaimModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { SettingsModal } from "./components/SettingsModal";
import supabase from "../hooks/use-supabase";
import MintModal from "../components/achievements/MintModal"; // Add this import


interface GameSession {
  id: string;
  date: string;
  duration: string;
  score: number;
  clicks: number;
  endReason: string;
}

interface HoneyClickerProps {
  gameName: string;
}

const HoneyClicker = ({ gameName }: HoneyClickerProps) => {
  const { toast } = useToast();

  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);


  // Game state
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTokenClaimModal, setShowTokenClaimModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSection, setActiveSection] = useState("shop");
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  // Track if the user dismissed the claim modal
  const [tokenClaimModalDismissed, setTokenClaimModalDismissed] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Match LoadingScreen delay
        setIsLoading(false);
        setGameStarted(true);
        setGameStartTime(new Date());
      } catch (error) {
        console.error('Failed to initialize game:', error);
        toast({
          title: "Error",
          description: "Failed to initialize game. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeGame();
  }, []); // Empty dependency array means this runs once on mount

  // Pass isPaused to useGameState to control honey development
  const {
    points,
    maxPoints,
    totalClicks,
    clickMultiplier,
    pointsPerSecond,
    ownedItems,
    addPoints,
    buyItem,
    canAfford
  } = useGameState(isPaused);

  // Calculate total purchases for achievements
  const totalPurchases = Object.values(ownedItems).reduce((sum, count) => sum + count, 0);

  // Token claiming
  const [claimedTokens, setClaimedTokens] = useState(0);
  const TOKEN_CLAIM_THRESHOLD = 10000;

  // UI state
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [clickAnimation, setClickAnimation] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });

  // Game history
  const [gameHistory, setGameHistory] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('honeyClickerHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Achievement state
  const [mintedAchievements, setMintedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('honeyClickerMintedAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Function to mark achievement as minted
  const markAchievementMinted = (achievementId: string) => {
    setMintedAchievements(prev => [...prev, achievementId]);
    localStorage.setItem('honeyClickerMintedAchievements', JSON.stringify([...mintedAchievements, achievementId]));
  };

  // Check for token claiming eligibility
  useEffect(() => {
    const unclaimedTokens = Math.floor(points / TOKEN_CLAIM_THRESHOLD) - claimedTokens;
    if (unclaimedTokens > 0 && gameStarted && !isPaused && !tokenClaimModalDismissed) {
      setShowTokenClaimModal(true);
    }
  }, [points, claimedTokens, gameStarted, isPaused, tokenClaimModalDismissed]);

  const handleLoadComplete = () => setIsLoading(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setGameStartTime(new Date());
  };

  const handleClaimTokens = () => {
    const unclaimedTokens = Math.floor(points / TOKEN_CLAIM_THRESHOLD) - claimedTokens;
    setClaimedTokens(prev => prev + unclaimedTokens);
    setTokenClaimModalDismissed(false); // Reset so modal can show again next time
    toast({
      title: "🪙 Tokens Claimed!",
      description: `You claimed ${unclaimedTokens} tokens worth ${unclaimedTokens * TOKEN_CLAIM_THRESHOLD} honey!`,
    });
  };

  const handleCloseTokenClaimModal = () => {
    setShowTokenClaimModal(false);
    setTokenClaimModalDismissed(true);
  };

  const saveGameSession = (endReason: string) => {
    if (!gameStartTime) return;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - gameStartTime.getTime()) / 1000);
    const durationString = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
    const session: GameSession = {
      id: Date.now().toString(),
      date: endTime.toLocaleDateString(),
      duration: durationString,
      score: Math.floor(points),
      clicks: totalClicks,
      endReason
    };
    const newHistory = [session, ...gameHistory].slice(0, 5);
    setGameHistory(newHistory);
    localStorage.setItem('honeyClickerHistory', JSON.stringify(newHistory));
  };

  const handlePauseGame = () => {
    setIsPaused(true);
    saveGameSession('Paused');
  };

  const handleResumeGame = () => {
    setIsPaused(false);
    setGameStartTime(new Date());
  };

  const handleSaveGame = () => {
    setShowSaveModal(true);
    setIsPaused(false);
    saveGameSession('Manual Save');
    toast({
      title: "Game Saved!",
      description: "Your progress has been saved successfully.",
    });
  };

  const handleResetGame = () => {
    saveGameSession('Game Reset');
    localStorage.removeItem('honeyClickerSave');
    window.location.reload();
  };

  const handleHoneyClick = useCallback((event: React.MouseEvent) => {
    if (isPaused || !gameStarted) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setParticlePosition({ x, y });
    setShowParticles(true);
    setClickAnimation(true);
    addPoints(clickMultiplier);
    setTimeout(() => {
      setClickAnimation(false);
      setShowParticles(false);
    }, 500);
  }, [addPoints, clickMultiplier, isPaused, gameStarted]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Honey Clicker',
        text: `I've collected ${Math.floor(points)} honey! 🍯`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const handleBuyItem = (itemId: string) => {
    const success = buyItem(itemId);
    if (success) {
      toast({
        title: "Purchase successful!",
        description: `You bought ${shopItems.find(item => item.id === itemId)?.name}`,
      });
    } else {
      toast({
        title: "Not enough honey!",
        description: "Collect more honey to buy this item",
        variant: "destructive",
      });
    }
  };

  const renderShopSection = () => (
    <div className="space-y-4 max-h-100 overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-800">🛒 Shop</h2>
      <div className="grid gap-2">
        {shopItems.map((item) => {
          const owned = ownedItems[item.id] || 0;
          const currentCost = Math.floor(item.baseCost * Math.pow(1.15, owned));
          const affordable = canAfford(item.id);

          return (
            <Card
              key={item.id}
              className={`
                p-2 
                transition-all 
                duration-200 
                hover:scale-105 
                ${affordable ? 'bg-card border-border' : 'bg-muted border-muted'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-lg">{item.emoji}</span>
                  <span className="ml-2 font-semibold text-amber-800">{item.name}</span>
                </div>
                {owned > 0 && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs animate-pulse">
                    {owned}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-600 mb-1">{item.description}</p>
              <div className="flex justify-between text-xs mb-1">
                <span>Cost:</span>
                <span className="font-semibold">🍯 {currentCost}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span>Click Bonus:</span>
                <span className="font-semibold">{item.clickMultiplier}x</span>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span>Per Second:</span>
                <span className="font-semibold">{item.passiveIncome}/s</span>
              </div>
              <Button
                onClick={() => handleBuyItem(item.id)}
                disabled={!affordable}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-xs transition-all duration-200 hover:scale-105"
              >
                Buy
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const achievementsPanelProps = {
    totalClicks,
    maxPoints,
    totalPurchases,
    mintedAchievements,
    // onMintSuccess: markAchievementMinted,
    onMintClick: (achievement:any) => {
      setSelectedAchievement(achievement); 
      console.log("gets here achievemtn is",achievement);
      setIsMintModalOpen(true);
    }
  };

  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100">
      {/* Game Header */}
      <div className="bg-amber-600/90 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h3 className="text-white font-semibold">{gameName}</h3>
          <div className="text-yellow-200">Honey: {Math.floor(points)}</div>
          <div className="text-yellow-200">Clicks: {totalClicks}</div>
          <div className="text-yellow-200">
            Per Second: {isPaused ? '⏸️ Paused' : pointsPerSecond.toFixed(1)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 transition-all duration-200"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 transition-all duration-200"
            onClick={handleShare}
          >
            <Share className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 transition-all duration-200"
            onClick={() => setShowHistoryModal(true)}
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 transition-all duration-200"
            onClick={() => setShowLeaderboardModal(true)}
          >
            <Trophy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-amber-700 transition-all duration-200"
            onClick={() => setShowSettingsModal(true)}
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-6 flex">
        {/* Left side - Clicker */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <Button
              className={`bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black text-6xl rounded-full w-48 h-48 shadow-xl transition-all duration-200 ${clickAnimation ? 'scale-110' : 'scale-100'} ${isPaused ? 'opacity-50 grayscale' : 'hover:scale-105'}`}
              onClick={handleHoneyClick}
              disabled={isPaused || !gameStarted}
            >
              🍯
            </Button>
            {showParticles && (
              <ClickParticles
                x={particlePosition.x}
                y={particlePosition.y}
                points={Math.floor(clickMultiplier)}
              />
            )}
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-amber-800 mb-2">
              {Math.floor(points)} Honey
            </div>
            <div className="text-lg text-amber-600">
              +{clickMultiplier} per click
            </div>
            {pointsPerSecond > 0 && (
              <div className={`text-sm ${isPaused ? 'text-red-500' : 'text-amber-500'} transition-colors duration-200`}>
                {isPaused ? '⏸️ Production Paused' : `+${pointsPerSecond.toFixed(1)} per second`}
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="flex space-x-4">
            {!gameStarted ? (
              <Button
                onClick={handleStartGame}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 transition-all duration-200 hover:scale-105"
              >
                Start Game
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPaused ? handleResumeGame : handlePauseGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 transition-all duration-200 hover:scale-105"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={handleSaveGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 transition-all duration-200 hover:scale-105"
                >
                  Save
                </Button>
                <Button
                  onClick={handleResetGame}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 transition-all duration-200 hover:scale-105"
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right side - Panels */}
        <div className="w-90 ml-6 space-y-4">
          {/* Section Tabs */}
          <div className="flex space-x-2">
            <Button
              variant={activeSection === "shop" ? "default" : "outline"}
              onClick={() => setActiveSection("shop")}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              Shop
            </Button>
            <Button
              variant={activeSection === "achievements" ? "default" : "outline"}
              onClick={() => setActiveSection("achievements")}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              Achievements
            </Button>
          </div>

          {/* Content Panel */}
          <Card className="p-4 h-96 overflow-hidden">
            {activeSection === "shop" && renderShopSection()}
            {activeSection === "achievements" && (
              <AchievementsPanel {...achievementsPanelProps} />
            )}
          </Card>
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300">
          <div className="bg-white rounded-xl p-8 text-center animate-scale-in">
            <h3 className="text-2xl font-bold text-amber-800 mb-4">Game Paused ⏸️</h3>
            <p className="text-gray-600 mb-4">Honey production is paused</p>
            <Button
              onClick={handleResumeGame}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 transition-all duration-200 hover:scale-105"
            >
              Resume Game
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          volume={volume}
          setVolume={setVolume}
        />
      )}
      {showLeaderboardModal && (
        <LeaderboardModal
          open={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}
      {showTokenClaimModal && (
        <TokenClaimModal
          open={showTokenClaimModal}
          onClose={handleCloseTokenClaimModal}
          onClaim={handleClaimTokens}
          tokens={Math.floor(points / TOKEN_CLAIM_THRESHOLD) - claimedTokens}
        />
      )}
      {showSaveModal && (
        <GameModals.SaveModal
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        />
      )}
      {showHistoryModal && (
        <HistoryModal
          open={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={gameHistory}
        />
      )}

      {isMintModalOpen && (
          <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        achievement={selectedAchievement}
        onMintSuccess={(achievement, txHash) => {
          // setIsMintModalOpen(false);
          // setSelectedAchievement(null);
          // markAchievementMinted(achievement.id);
        }}
      />
      )}

    
    </div>
  );
};

export default HoneyClicker;