import React, { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Share, History, Trophy, Settings as SettingsIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Slider } from "../../components/ui/slider";
import { useToast } from "../../hooks/use-toast";
import { useGameState } from "./hooks/useGameState";
import { shopItems } from "./data/shopItems";
import { ClickParticles } from "./components/ClickParticles";
import { LoadingScreen } from "./components/LoadingScreen";
import { GameModals } from "./components/GameModals";
import { GameSidebar } from "./components/GameSidebar";
import { AchievementsPanel } from "./components/AchievementsPanel";
import { HistoryModal } from "./components/HistoryModal";
import { TokenClaimModal } from "./components/TokenClaimModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { SettingsModal } from "./components/SettingsModal";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../components/ui/sidebar";

interface GameSession {
  id: string;
  date: string;
  duration: string;
  score: number;
  clicks: number;
  endReason: string;
}

const HiveGame = () => {
  const { toast } = useToast();
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
  } = useGameState();

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

  // Check for token claiming eligibility
  useEffect(() => {
    const unclaimedTokens = Math.floor(points / TOKEN_CLAIM_THRESHOLD) - claimedTokens;
    if (unclaimedTokens > 0 && gameStarted) {
      setShowTokenClaimModal(true);
    }
  }, [points, claimedTokens, gameStarted]);

  // Achievements
  const [achievements] = useState([
    {
      id: "first_click",
      title: "First Steps",
      description: "Click the honey jar for the first time",
      icon: "🍯",
      requirement: 1,
      current: totalClicks,
      completed: totalClicks >= 1,
      reward: "Welcome bonus!"
    },
    {
      id: "hundred_clicks",
      title: "Clicking Master",
      description: "Click 100 times",
      icon: "👆",
      requirement: 100,
      current: totalClicks,
      completed: totalClicks >= 100,
      reward: "+10% click bonus"
    },
    {
      id: "first_purchase",
      title: "Shopkeeper",
      description: "Buy your first item from the shop",
      icon: "🛒",
      requirement: 1,
      current: Object.values(ownedItems).reduce((sum, count) => sum + count, 0),
      completed: Object.values(ownedItems).reduce((sum, count) => sum + count, 0) >= 1,
      reward: "Shopping unlocked!"
    },
    {
      id: "thousand_honey",
      title: "Sweet Success",
      description: "Collect 1,000 honey",
      icon: "🐝",
      requirement: 1000,
      current: Math.floor(maxPoints),
      completed: maxPoints >= 1000,
      reward: "Bee power!"
    },
    {
      id: "token_claimer",
      title: "Token Collector",
      description: "Claim your first token batch",
      icon: "🪙",
      requirement: 1,
      current: claimedTokens,
      completed: claimedTokens >= 1,
      reward: "Token master!"
    }
  ]);

  const handleLoadComplete = () => setIsLoading(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setGameStartTime(new Date());
  };

  const handleClaimTokens = () => {
    const unclaimedTokens = Math.floor(points / TOKEN_CLAIM_THRESHOLD) - claimedTokens;
    setClaimedTokens(prev => prev + unclaimedTokens);
    setShowTokenClaimModal(false);
    toast({
      title: "🪙 Tokens Claimed!",
      description: `You claimed ${unclaimedTokens * TOKEN_CLAIM_THRESHOLD} tokens!`,
    });
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-800">🛒 Shop</h2>
      <div className="grid gap-2">
        {shopItems.map((item) => {
          const owned = ownedItems[item.id] || 0;
          const currentCost = Math.floor(item.baseCost * Math.pow(1.15, owned));
          const affordable = canAfford(item.id);

          return (
            <Card key={item.id} className="p-2 bg-white/70 border-amber-200">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-lg">{item.emoji}</span>
                  <span className="ml-2 font-semibold text-amber-800">{item.name}</span>
                </div>
                {owned > 0 && (
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
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
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-xs"
              >
                Buy
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  // --- MODAL-LIKE, SMALL, CENTERED GAME AREA ---
  return (
    <div
      className="flex flex-col items-center justify-between bg-black/60 rounded-2xl shadow-2xl p-4"
      style={{
        width: 420,
        height: 560,
        maxWidth: '95vw',
        maxHeight: '80vh',
        minWidth: 320,
        minHeight: 400,
        position: "relative",
      }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-purple-700/40"
          onClick={() => setShowSettingsModal(true)}
        >
          <SettingsIcon size={20} />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-purple-700/40"
            onClick={() => setIsMuted((m) => !m)}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-purple-700/40"
            onClick={() => setShowLeaderboardModal(true)}
          >
            <Trophy size={20} />
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <Button
          className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black text-2xl rounded-full w-24 h-24 shadow-lg mb-2 hover:scale-105 transition"
          onClick={handleHoneyClick}
          disabled={isPaused || !gameStarted}
        >
          🍯
        </Button>
        <div className="text-center mb-1">
          <div className="text-2xl font-bold text-yellow-300">{Math.floor(points)} Honey</div>
          <div className="text-xs text-purple-200">Clicks: {totalClicks}</div>
        </div>
        <div className="w-full bg-purple-900/40 rounded-full h-2 mb-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((points / 10000) * 100, 100)}%` }}
          />
        </div>
        {/* Shop/Upgrades */}
        <div className="w-full flex flex-col gap-1 mb-1">
          <Card className="bg-purple-900/30 border-purple-700/30 p-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-xs">Shop</span>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs px-2 py-1"
                onClick={() => setActiveSection("shop")}
              >
                View
              </Button>
            </div>
          </Card>
          <Card className="bg-purple-900/30 border-purple-700/30 p-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-xs">Achievements</span>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs px-2 py-1"
                onClick={() => setActiveSection("achievements")}
              >
                View
              </Button>
            </div>
          </Card>
        </div>
        {/* Section Panels */}
        {activeSection === "shop" && (
          <div className="w-full mt-1">{renderShopSection()}</div>
        )}
        {activeSection === "achievements" && (
          <div className="w-full mt-1">
            <AchievementsPanel achievements={achievements} />
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="w-full flex justify-between items-center mt-2">
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          onClick={handleStartGame}
          disabled={gameStarted}
        >
          Start
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs"
          onClick={handlePauseGame}
          disabled={!gameStarted}
        >
          Pause
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs"
          onClick={handleSaveGame}
          disabled={!gameStarted}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-xs"
          onClick={handleResetGame}
        >
          Reset
        </Button>
      </div>

      {/* Modals */}
      {showSettingsModal && (
        <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}
      {showLeaderboardModal && (
        <LeaderboardModal open={showLeaderboardModal} onClose={() => setShowLeaderboardModal(false)} />
      )}
      {showTokenClaimModal && (
        <TokenClaimModal open={showTokenClaimModal} onClose={() => setShowTokenClaimModal(false)} onClaim={handleClaimTokens} />
      )}
      {showSaveModal && (
        <GameModals.SaveModal open={showSaveModal} onClose={() => setShowSaveModal(false)} />
      )}
      {showHistoryModal && (
        <HistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} history={gameHistory} />
      )}
    </div>
  );
};

export default HiveGame;