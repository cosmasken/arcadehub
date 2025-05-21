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
import { CoinsIcon, Trophy, Zap, Flame, Star } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  type: 'wins' | 'streak' | 'total_games';
  unlocked: boolean;
  reward: number;
}

const TicTacToe = () => {
  const { aaWallet, aaSigner, refreshBalance } = useAAWallet();
  const { addReward, setTotals } = useRewardsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Game State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X'|'O'>('X');
  const [gameStatus, setGameStatus] = useState<'playing'|'won'|'draw'>('playing');
  
  // Stats
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [arcPoints, setArcPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  
  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "First Blood",
      description: "Win your first game",
      requirement: 1,
      type: 'wins',
      unlocked: false,
      reward: 10
    },
    {
      id: 2,
      name: "Seasoned Player",
      description: "Win 10 games",
      requirement: 10,
      type: 'wins',
      unlocked: false,
      reward: 50
    },
    {
      id: 3,
      name: "Hot Streak",
      description: "Achieve a 5-win streak",
      requirement: 5,
      type: 'streak',
      unlocked: false,
      reward: 100
    },
    {
      id: 4,
      name: "Veteran",
      description: "Play 50 games",
      requirement: 50,
      type: 'total_games',
      unlocked: false,
      reward: 200
    }
  ]);

  const checkWinner = (squares: (string|null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleCellClick = async (index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    // Player move
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Check win
    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      handleWin();
      return;
    }

    // Check draw
    if (!newBoard.includes(null)) {
      handleDraw();
      return;
    }

    // AI move
    setTimeout(() => {
      const emptyCells = newBoard
        .map((cell, idx) => cell === null ? idx : null)
        .filter(cell => cell !== null) as number[];
      
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[randomCell] = 'O';
      setBoard(newBoard);

      // Check AI win
      const aiWinner = checkWinner(newBoard);
      if (aiWinner === 'O') {
        handleLoss();
      } else if (!newBoard.includes(null)) {
        handleDraw();
      }
    }, 500);
  };

  const handleWin = () => {
    const earned = 10 + (currentStreak * 2);
    setWins(w => w + 1);
    setCurrentStreak(s => s + 1);
    setArcPoints(p => p + earned);
    setTotalEarned(t => t + earned);
    setGameStatus('won');
    toast.success("Victory!", { description: `Earned ${earned} ARC!` });
  };

  const handleLoss = () => {
    setLosses(l => l + 1);
    setCurrentStreak(0);
    setGameStatus('won');
    toast.error("Defeat!", { description: "Better luck next time!" });
  };

  const handleDraw = () => {
    setDraws(d => d + 1);
    setCurrentStreak(0);
    setGameStatus('draw');
    toast.info("Draw!", { description: "It's a tie!" });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameStatus('playing');
  };

  useEffect(() => {
    const newAchievements = [...achievements];
    let updated = false;
    
    newAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let requirement = false;
      const totalGames = wins + losses + draws;
      
      switch (achievement.type) {
        case 'wins':
          requirement = wins >= achievement.requirement;
          break;
        case 'streak':
          requirement = currentStreak >= achievement.requirement;
          break;
        case 'total_games':
          requirement = totalGames >= achievement.requirement;
          break;
      }
      
      if (requirement) {
        achievement.unlocked = true;
        setArcPoints(prev => prev + achievement.reward);
        setTotalEarned(prev => prev + achievement.reward);
        updated = true;
        
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `Reward: ${achievement.reward} ARC`,
        });
      }
    });
    
    if (updated) {
      setAchievements(newAchievements);
    }
  }, [wins, currentStreak, draws, losses]);

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
        game: "Tic Tac Toe",
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
            <h1 className="text-4xl font-bold mb-2">ARC Tic Tac Toe</h1>
            <p className="text-muted-foreground">Defeat the AI to earn ARC tokens!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Stats Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Game Stats</CardTitle>
                <CardDescription>Player Performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Wins:</span>
                  <span className="font-bold flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    {wins}
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
                  <span className="text-muted-foreground">Total ARC Earned:</span>
                  <span className="font-bold flex items-center">
                    <CoinsIcon className="w-4 h-4 mr-1 text-yellow-500" />
                    {totalEarned}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Games Played:</span>
                  <span className="font-bold">{wins + losses + draws}</span>
                </div>
              </CardContent>
            </Card>

            {/* Game Board */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {gameStatus === 'playing' ? "Current Game" : 
                   gameStatus === 'won' ? "Game Over" : "Draw!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <div className="grid grid-cols-3 gap-2 w-64 h-64">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={gameStatus !== 'playing' || cell !== null}
                      className={`h-20 w-20 text-3xl font-bold flex items-center justify-center
                        ${cell ? 'bg-secondary' : 'bg-muted/50'} 
                        ${gameStatus === 'playing' && !cell ? 'hover:bg-muted' : ''}
                        transition-colors`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  onClick={resetGame}
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
                <CardDescription>Battle milestones</CardDescription>
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
                            achievement.type === 'wins' ? (wins / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (currentStreak / achievement.requirement) * 100 :
                            ((wins + losses + draws) / achievement.requirement) * 100
                          }
                          className="h-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {Math.floor(
                            achievement.type === 'wins' ? (wins / achievement.requirement) * 100 :
                            achievement.type === 'streak' ? (currentStreak / achievement.requirement) * 100 :
                            ((wins + losses + draws) / achievement.requirement) * 100
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

export default TicTacToe;