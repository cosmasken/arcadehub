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
import { CoinsIcon, Star, Zap, Flame, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const SYMBOLS = ['🍒', '🍊', '🍋', '💎', '7️⃣', '💰'];
const PAYOUTS = {
  '💎💎💎': 100,
  '💰💰💰': 50,
  '7️⃣7️⃣7️⃣': 30,
  '🍋🍋🍋': 20,
  '🍊🍊🍊': 15,
  '🍒🍒🍒': 10,
  '🍒🍒*': 5,
  '🍒**': 2
};

interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  type: 'spins' | 'wins' | 'streak';
  unlocked: boolean;
  reward: number;
}

const SpinToWin = () => {
  const { aaWallet, aaSigner, refreshBalance } = useAAWallet();
  const { addReward, setTotals } = useRewardsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Game State
  const [reels, setReels] = useState(['?', '?', '?']);
  const [arcBalance, setArcBalance] = useState(100);
  const [totalEarned, setTotalEarned] = useState(0);
  const [spins, setSpins] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  
  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "First Spin",
      description: "Complete 10 spins",
      requirement: 10,
      type: 'spins',
      unlocked: false,
      reward: 20
    },
    {
      id: 2,
      name: "High Roller",
      description: "Win 5 times in a row",
      requirement: 5,
      type: 'streak',
      unlocked: false,
      reward: 100
    },
    {
      id: 3,
      name: "Jackpot Hunter",
      description: "Hit 3 diamonds",
      requirement: 1,
      type: 'wins',
      unlocked: false,
      reward: 200
    }
  ]);

  const spinReels = () => {
    if (arcBalance < 10 || isSpinning) return;
    
    setIsSpinning(true);
    setArcBalance(b => b - 10);
    setSpins(s => s + 1);

    // Generate random symbols with animation
    const intervals = [];
    for (let i = 0; i < 3; i++) {
      intervals.push(
        setInterval(() => {
          setReels(prev => {
            const newReels = [...prev];
            newReels[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            return newReels;
          });
        }, 50)
      );
    }

    // Stop spinning after 2 seconds
    setTimeout(() => {
      intervals.forEach(clearInterval);
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      
      setReels(finalReels);
      calculatePayout(finalReels);
      setIsSpinning(false);
    }, 2000);
  };

  const calculatePayout = (reels: string[]) => {
    const combo = reels.join('');
    let multiplier = 0;
    
    // Check payout patterns
    for (const [pattern, value] of Object.entries(PAYOUTS)) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.')}$`);
      if (regex.test(combo)) {
        multiplier = value;
        break;
      }
    }

    if (multiplier > 0) {
      const winnings = 10 * multiplier;
      setArcBalance(b => b + winnings);
      setTotalEarned(t => t + winnings);
      setWinStreak(s => s + 1);
      toast.success(`Winner! ${combo}`, { description: `Won ${winnings} ARC!` });
    } else {
      setWinStreak(0);
      toast.error("No Win", { description: "Try again!" });
    }
  };

  useEffect(() => {
    const newAchievements = [...achievements];
    let updated = false;
    
    newAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let requirement = false;
      
      switch (achievement.type) {
        case 'spins':
          requirement = spins >= achievement.requirement;
          break;
        case 'streak':
          requirement = winStreak >= achievement.requirement;
          break;
        case 'wins':
          requirement = totalEarned >= achievement.requirement;
          break;
      }
      
      if (requirement) {
        achievement.unlocked = true;
        const reward = achievement.reward;
        setArcBalance(b => b + reward);
        setTotalEarned(t => t + reward);
        updated = true;
        
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `Reward: ${reward} ARC`,
        });
      }
    });
    
    if (updated) {
      setAchievements(newAchievements);
    }
  }, [spins, winStreak, totalEarned]);

  const handleClaimEarnings = async () => {
    if (!aaSigner || !arcBalance || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const contract = getArcadeHubContract(aaSigner);
      const tx = await contract.recordGameEarnings(arcBalance);
      await tx.wait();
      
      setArcBalance(100); // Reset to starting balance
      addReward({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        game: "Spin to Win",
        type: "Earn",
        amount: arcBalance
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
            <h1 className="text-4xl font-bold mb-2">ARC Spin to Win</h1>
            <p className="text-muted-foreground">10 ARC per spin - Good luck!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Stats Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Player Stats</CardTitle>
                <CardDescription>Casino Performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ARC Balance:</span>
                  <span className="font-bold flex items-center">
                    <CoinsIcon className="w-4 h-4 mr-1 text-yellow-500" />
                    {arcBalance}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Spins:</span>
                  <span className="font-bold flex items-center">
                    <RotateCw className="w-4 h-4 mr-1 text-blue-500" />
                    {spins}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Win Streak:</span>
                  <span className="font-bold flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-red-500" />
                    {winStreak}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Earned:</span>
                  <span className="font-bold flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-green-500" />
                    {totalEarned}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Game Area */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {isSpinning ? "Spinning..." : "Try Your Luck!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <div className="flex gap-4">
                  {reels.map((reel, index) => (
                    <div 
                      key={index}
                      className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-4xl
                        border-2 border-muted-foreground/20"
                    >
                      {reel}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  onClick={spinReels}
                  disabled={arcBalance < 10 || isSpinning}
                  className="w-full bg-arcade-yellow hover:bg-arcade-yellow/80 text-black text-xl py-6"
                >
                  {isSpinning ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `SPIN (10 ARC)`
                  )}
                </Button>
                {aaSigner && (
                  <Button
                    onClick={handleClaimEarnings}
                    disabled={isSubmitting}
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
                        Cash Out {arcBalance} ARC
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
                <CardDescription>Casino Milestones</CardDescription>
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
                            achievement.type === 'spins' ? (spins / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (winStreak / achievement.requirement) * 100 :
                            (totalEarned / achievement.requirement) * 100
                          }
                          className="h-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {Math.floor(
                            achievement.type === 'spins' ? (spins / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (winStreak / achievement.requirement) * 100 :
                            (totalEarned / achievement.requirement) * 100
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

export default SpinToWin;