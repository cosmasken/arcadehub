import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/config";
import { getArcadeHubContract } from "@/lib/contractUtils";
import { useAAWallet } from "@/hooks/useAAWallet";
import { useRewardsStore } from "@/hooks/use-rewards";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinsIcon, Star, Zap, Flame, Clock } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const EMOJIS = ['🎮', '👾', '🕹️', '🎲', '🎯', '🧩', '🛸', '👑'];
const PAIRS = 8; // 4x4 grid

interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  type: 'matches' | 'streak' | 'moves';
  unlocked: boolean;
  reward: number;
}

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame = () => {
  const { aaWallet, aaSigner, refreshBalance } = useAAWallet();
  const { addReward, setTotals } = useRewardsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Game State
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [arcPoints, setArcPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [gameStatus, setGameStatus] = useState<'waiting'|'checking'>('waiting');

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "First Match",
      description: "Find your first pair",
      requirement: 1,
      type: 'matches',
      unlocked: false,
      reward: 10
    },
    {
      id: 2,
      name: "Match Master",
      description: "Find 20 pairs",
      requirement: 20,
      type: 'matches',
      unlocked: false,
      reward: 50
    },
    {
      id: 3,
      name: "Hot Streak",
      description: "Find 5 consecutive matches",
      requirement: 5,
      type: 'streak',
      unlocked: false,
      reward: 100
    },
    {
      id: 4,
      name: "Speed Runner",
      description: "Complete a game in 20 moves",
      requirement: 20,
      type: 'moves',
      unlocked: false,
      reward: 200
    }
  ]);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const emojis = [...EMOJIS.slice(0, PAIRS), ...EMOJIS.slice(0, PAIRS)]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(emojis);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setCurrentStreak(0);
    setGameStatus('waiting');
  };

  const handleCardClick = (index: number) => {
    if (
      gameStatus === 'checking' ||
      selectedCards.includes(index) ||
      cards[index].isMatched
    ) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    
    // Flip card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newSelected.length === 2) {
      checkMatch(newSelected);
    }
  };

  const checkMatch = (selected: number[]) => {
    setGameStatus('checking');
    setMoves(m => m + 1);
    
    setTimeout(() => {
      const [first, second] = selected;
      const isMatch = cards[first].emoji === cards[second].emoji;

      const newCards = cards.map(card => {
        if (selected.includes(card.id)) {
          return { ...card, isMatched: isMatch, isFlipped: isMatch };
        }
        return card;
      });

      if (isMatch) {
        const earned = 10 + (currentStreak * 2);
        setMatches(m => m + 1);
        setCurrentStreak(s => s + 1);
        setArcPoints(p => p + earned);
        setTotalEarned(t => t + earned);
        toast.success("Match!", { description: `Earned ${earned} ARC!` });
        
        // Check game completion
        if (matches + 1 === PAIRS) {
          toast.success("Game Complete!", { description: "All pairs found!" });
        }
      } else {
        // Flip back non-matching cards
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCurrentStreak(0);
        toast.error("Try Again!");
      }

      setCards(newCards);
      setSelectedCards([]);
      setGameStatus('waiting');
    }, 1000);
  };

  useEffect(() => {
    const newAchievements = [...achievements];
    let updated = false;
    
    newAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let requirement = false;
      
      switch (achievement.type) {
        case 'matches':
          requirement = matches >= achievement.requirement;
          break;
        case 'streak':
          requirement = currentStreak >= achievement.requirement;
          break;
        case 'moves':
          requirement = (moves >= achievement.requirement) && (matches === PAIRS);
          break;
      }
      
      if (requirement) {
        achievement.unlocked = true;
        const reward = achievement.reward;
        setArcPoints(prev => prev + reward);
        setTotalEarned(prev => prev + reward);
        updated = true;
        
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `Reward: ${reward} ARC`,
        });
      }
    });
    
    if (updated) {
      setAchievements(newAchievements);
    }
  }, [matches, currentStreak, moves]);

  const handleClaimEarnings = async () => {
    if (!aaSigner || !arcPoints || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const contract = getArcadeHubContract(aaSigner);
      const tx = await contract.recordGameEarnings(arcPoints);
      await tx.wait();
      
      setArcPoints(0);
      addReward({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        game: "Memory Match",
        type: "Earn",
        amount: arcPoints
      });
      await refreshBalance();
      toast.success("Earnings claimed successfully!");
    } catch (error) {
      console.error("Error claiming earnings:", error);
      toast.error("Failed to claim earnings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">ARC Memory Match</h1>
            <p className="text-muted-foreground">Find matching pairs to earn tokens!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Stats Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Game Stats</CardTitle>
                <CardDescription>Match Performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Matches:</span>
                  <span className="font-bold flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                    {matches}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Streak:</span>
                  <span className="font-bold flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-red-500" />
                    {currentStreak}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Moves:</span>
                  <span className="font-bold flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    {moves}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ARC Earned:</span>
                  <span className="font-bold flex items-center">
                    <CoinsIcon className="w-4 h-4 mr-1 text-yellow-500" />
                    {totalEarned}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Game Board */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {matches === PAIRS ? "Game Complete!" : "Find the Pairs"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <div className="grid grid-cols-4 gap-2 w-96 h-96">
                  {cards.map((card, index) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(index)}
                      disabled={gameStatus === 'checking' || card.isMatched}
                      className={`h-20 w-20 text-3xl flex items-center justify-center
                        transition-all duration-300 [transform-style:preserve-3d]
                        ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}
                        ${card.isMatched ? 'bg-arcade-yellow' : 'bg-muted'}
                        ${!card.isMatched && gameStatus === 'waiting' ? 'hover:bg-muted/80' : ''}
                        rounded-lg`}
                    >
                      <div className="w-full h-full flex items-center justify-center [backface-visibility:hidden]">
                        {card.isFlipped || card.isMatched ? (
                          <span>{card.emoji}</span>
                        ) : (
                          <span className="text-2xl">?</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  onClick={startNewGame}
                  className="w-full bg-arcade-yellow hover:bg-arcade-yellow/80 text-black"
                >
                  New Game
                </Button>
                {aaSigner && (
                  <Button
                    onClick={handleClaimEarnings}
                    disabled={isSubmitting || arcPoints === 0}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CoinsIcon className="mr-2 h-4 w-4" />
                        Claim {arcPoints} ARC
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Achievements */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Memory milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`border ${achievement.unlocked ? 
                    'border-arcade-yellow bg-secondary/30' : 'border-muted'} p-3 rounded-lg`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        {achievement.unlocked && 
                          <Star className="w-4 h-4 mr-1 text-arcade-yellow" fill="currentColor" />}
                        {achievement.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        achievement.unlocked ? 'bg-arcade-yellow text-black' : 'bg-muted'
                      }`}>
                        {achievement.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress
                          value={
                            achievement.type === 'matches' ? (matches / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (currentStreak / achievement.requirement) * 100 :
                            ((moves || 1) / achievement.requirement) * 100
                          }
                          className="h-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {Math.floor(
                            achievement.type === 'matches' ? (matches / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (currentStreak / achievement.requirement) * 100 :
                            ((moves || 1) / achievement.requirement) * 100
                          )}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemoryGame;