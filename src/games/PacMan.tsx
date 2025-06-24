import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, Star, Plus, GamepadIcon, Sparkles, Coins } from 'lucide-react';
import MintingModal from '../components/MintingModal';
import LoadingModal from '../components/LoadingModal';
import TokenClaimModal from '../components/TokenClaimModal';
import { useGameState } from '../hooks/useGameState';
import { achievements as achievementsMap } from '../data/achievements';
import { shopItems } from '../data/shopItems';
import supabase from '../hooks/use-supabase';
import { useWalletStore } from '../stores/useWalletStore';
import { submitTournamentScoreAA, getProvider } from '../lib/aaUtils';
import { useToast } from '../hooks/use-toast';
import { ethers } from 'ethers';
import { TESTNET_CONFIG } from '../config';
import TournamentHubABI from '../abi/TournamentHub.json';

// Maze layout: 0=wall, 1=dot, 2=player, 3=ghost
const initialMaze = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 0, 2, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 0, 3, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const achievements = Object.values(achievementsMap);

const PacMan = () => {
  const { points, addPoints, claimPoints, canClaim, ownedItems, buyItem, canAfford } = useGameState();
  const { aaWalletAddress, aaSigner } = useWalletStore();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maze, setMaze] = useState(initialMaze);
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 5 });
  const [ghostPos, setGhostPos] = useState({ x: 5, y: 8 });
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMintingModalOpen, setIsMintingModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [joinedLiveTournament, setJoinedLiveTournament] = useState<number | null>(null);
  const [loadingTitle, setLoadingTitle] = useState('Loading Game');
  const [loadingDescription, setLoadingDescription] = useState('Please wait while we load the game...');
  const [loadingTransactionText, setLoadingTransactionText] = useState('Loading...');
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<unknown>(null);
  const [mintedAchievements, setMintedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('pacManMintedAchievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<number, boolean>>({});

  const claimableTokens = Math.floor(points / 10000);
  const pointsToSpend = claimableTokens * 10000;

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(
          TESTNET_CONFIG.smartContracts.tournamentHub,
          TournamentHubABI,
          provider
        );
        const activeIds: number[] = await contract.getActiveTournamentIds();
        for (const id of activeIds) {
          const info = await contract.getTournamentInfo(id, aaWalletAddress);
          if (info.isParticipant && info.isActive) {
            setJoinedLiveTournament(Number(id));
            break;
          }
        }
      } catch (e) {
        console.error('Error fetching tournaments:', e);
        setJoinedLiveTournament(null);
      }
      setLoading(false);
    }
    if (aaWalletAddress && TESTNET_CONFIG.smartContracts.tournamentHub) {
      fetchTournaments();
    }
  }, [aaWalletAddress]);

  useEffect(() => {
    if (loading) {
      setIsLoadingModalOpen(true);
      setLoadingTitle('Checking your tournaments');
      setLoadingDescription('Please wait while we check your tournament participation...');
      setLoadingTransactionText('Checking...');
    } else {
      setIsLoadingModalOpen(false);
    }
  }, [loading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 40;
    canvas.width = maze[0].length * cellSize;
    canvas.height = maze.length * cellSize;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      maze.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 0) {
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          } else if (cell === 1) {
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 5, 0, 2 * Math.PI);
            ctx.fill();
          } else if (cell === 2) {
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 15, 0, 2 * Math.PI);
            ctx.fill();
          } else if (cell === 3) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x * cellSize + 10, y * cellSize + 10, cellSize - 20, cellSize - 20);
          }
        });
      });
    };

    draw();

    const moveGhost = () => {
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      const { dx, dy } = directions[Math.floor(Math.random() * 4)];
      const newX = ghostPos.x + dx;
      const newY = ghostPos.y + dy;
      if (maze[newY]?.[newX] !== 0) {
        setMaze((prev) => {
          const newMaze = prev.map((row) => [...row]);
          newMaze[ghostPos.y][ghostPos.x] = 1;
          newMaze[newY][newX] = 3;
          return newMaze;
        });
        setGhostPos({ x: newX, y: newY });
        if (newX === playerPos.x && newY === playerPos.y) {
          setGameOver(true);
          saveGameSession('game_over');
        }
      }
    };

    const ghostInterval = setInterval(moveGhost, 500);
    return () => clearInterval(ghostInterval);
  }, [ghostPos, playerPos, maze]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      let newX = playerPos.x;
      let newY = playerPos.y;
      if (e.key === 'ArrowUp') newY--;
      if (e.key === 'ArrowDown') newY++;
      if (e.key === 'ArrowLeft') newX--;
      if (e.key === 'ArrowRight') newX++;
      if (maze[newY]?.[newX] !== 0) {
        setMaze((prev)  => {
          const newMaze = prev.map((row) => [...row]);
          if (newMaze[newY][newX] === 1) {
            addPoints(10);
            newMaze[newY][newX] = 0;
          }
          newMaze[playerPos.y][playerPos.x] = 0;
          newMaze[newY][newX] = 2;
          return newMaze;
        });
        setPlayerPos({ x: newX, y: newY });
        if (newX === ghostPos.x && newY === ghostPos.y) {
          setGameOver(true);
          saveGameSession('game_over');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, maze, ghostPos, addPoints, gameOver]);

  useEffect(() => {
    setGameStartTime(new Date());
    return () => {
      if (gameStartTime) saveGameSession('page_unload');
    };
  }, [gameStartTime]);

  useEffect(() => {
    achievements.forEach((achievement) => {
      if (!achievement.id || unlockedAchievements[achievement.id]) return;
      let shouldUnlock = false;
      if (achievement.requirement) shouldUnlock = points >= achievement.requirement;
      if (achievement.clicksRequired) shouldUnlock = maze.flat().filter(cell => cell === 0).length >= achievement.clicksRequired;
      if (achievement.purchasesRequired) shouldUnlock = Object.values(ownedItems).reduce((sum, count) => sum + count, 0) >= achievement.purchasesRequired;
      if (shouldUnlock) {
        setUnlockedAchievements((prev) => ({ ...prev, [achievement.id!]: true }));
      }
    });
  }, [points, maze, ownedItems, unlockedAchievements]);

  const saveGameSession = async (endReason: string) => {
    if (!aaWalletAddress || !gameStartTime) return;
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - gameStartTime.getTime()) / 1000);
    await supabase.from('game_plays').insert([
      {
        game_id: 'pac-man',
        player_wallet: aaWalletAddress,
        played_at: endTime.toISOString(),
        session_duration: duration,
        score: Math.floor(points),
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        unique_session_id: `${aaWalletAddress}-${endTime.getTime()}`,
        end_reason: endReason,
      },
    ]);
  };

  const handleSubmitScore = async (tournamentId: number) => {
    if (!aaSigner) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet.', variant: 'destructive' });
      return;
    }
    setIsLoadingModalOpen(true);
    setLoadingTitle('Submitting Score');
    setLoadingDescription('Please wait while we submit your score to the tournament...');
    setLoadingTransactionText('Submitting...');
    try {
      const signature = '0x';
      const result = await submitTournamentScoreAA(
        aaSigner,
        tournamentId,
        Math.floor(points),
        signature,
        0
      );
      if (!result.userOpHash) {
        throw new Error('Transaction failed. No UserOperation hash returned.');
      }
      toast({
        title: 'Score Submitted',
        description: (
          <span>
            Score {Math.floor(points)} submitted to Tournament #{tournamentId}.
            <a
              href={`https://testnet.neroscan.io/tx/${result.transactionHash}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 underline'
            >
              View on Sepolia Etherscan
            </a>
          </span>
        ),
      });
    } catch (err) {
      console.error('Score submission error:', err);
      toast({ title: 'Submission Failed', description: err.message || 'Failed to submit score.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handleRestart = () => {
    setMaze(initialMaze);
    setPlayerPos({ x: 5, y: 5 });
    setGhostPos({ x: 5, y: 8 });
    setGameOver(false);
    setGameStartTime(new Date());
  };

  return (
    <div className='min-h-screen bg-black text-green-400 font-mono'>
      <Header />
      <TokenClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        claimableTokens={claimableTokens}
        honeyToSpend={pointsToSpend}
        onClaim={() => {
          claimPoints(pointsToSpend);
          setIsClaimModalOpen(false);
        }}
      />
      <div className='pt-24 pb-16 px-6'>
        <div className='container mx-auto max-w-7xl'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text'>PAC-MAN</h1>
            <p className='text-green-400 text-lg tracking-wider'>EAT DOTS, AVOID GHOSTS</p>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              {claimableTokens > 0 && (
                <Card className='bg-yellow-400/10 border-yellow-400 border-2 p-6 mb-6 animate-pulse'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Sparkles className='w-8 h-8 text-yellow-400' />
                      <div>
                        <h3 className='text-xl font-bold text-yellow-400 neon-text'>TOKEN CLAIM AVAILABLE!</h3>
                        <p className='text-green-400'>
                          Convert {pointsToSpend.toLocaleString()} points → {claimableTokens} HIVE tokens
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsClaimModalOpen(true)}
                      className='bg-yellow-400 text-black hover:bg-yellow-300 font-mono font-bold'
                    >
                      <Coins className='w-5 h-5 mr-2' />
                      CLAIM {claimableTokens} TOKENS
                    </Button>
                  </div>
                </Card>
              )}
              <Card className='bg-black border-cyan-400 border-2 p-8 text-center mb-6'>
                <div className='mb-6'>
                  <h2 className='text-4xl font-bold text-yellow-400 mb-2'>
                    {Math.floor(points).toLocaleString()} POINTS
                  </h2>
                  <p className='text-green-400'>10 POINTS PER DOT</p>
                </div>
                <canvas ref={canvasRef} className='mx-auto border-2 border-cyan-400' />
                {gameOver && (
                  <Button
                    onClick={handleRestart}
                    className='mt-4 bg-green-400 text-black hover:bg-cyan-400 font-mono'
                  >
                    RESTART
                  </Button>
                )}
              </Card>
              <Card className='bg-black border-cyan-400 border-2 p-6'>
                <div className='flex items-center space-x-4 mb-4'>
                  <Trophy className='w-6 h-6 text-yellow-400' />
                  <h3 className='text-xl font-bold text-cyan-400'>ACHIEVEMENTS</h3>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2'>
                  {achievements.map((achievement) => {
                    if (!achievement.id) return null;
                    const unlocked = unlockedAchievements[achievement.id];
                    const minted = mintedAchievements.includes(achievement.id.toString());
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 border ${unlocked ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600'}`}
                      >
                        <div className='flex items-center space-x-2 mb-1'>
                          <span className='text-2xl'>{achievement.emoji}</span>
                          <span className={`font-bold text-sm ${unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {achievement.title}
                          </span>
                        </div>
                        <p className='text-xs text-green-400'>{achievement.description}</p>
                        {unlocked && !minted && (
                          <Button
                            size='sm'
                            className='mt-2 bg-green-400 text-black hover:bg-cyan-400'
                            onClick={() => {
                              setSelectedAchievement(achievement);
                              setIsMintingModalOpen(true);
                            }}
                          >
                            Mint Achievement
                          </Button>
                        )}
                        {minted && (
                          <span className='mt-2 inline-block text-xs text-green-400'>Minted</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className='bg-black border-cyan-400 border-2 p-6 mt-6'>
                <h3 className='text-xl font-bold text-cyan-400 mb-4'>TOURNAMENTS</h3>
                <div>
                  {joinedLiveTournament !== null ? (
                    <Button
                      onClick={() => handleSubmitScore(joinedLiveTournament)}
                      className='bg-green-400 text-black hover:bg-cyan-400 font-mono'
                    >
                      Submit Score to Tournament #{joinedLiveTournament}
                    </Button>
                  ) : (
                    <p className='text-green-400'>You must join a live tournament to submit a score.</p>
                  )}
                </div>
              </Card>
            </div>
            <div>
              <Card className='bg-black border-cyan-400 border-2 p-6'>
                <div className='flex items-center space-x-4 mb-6'>
                  <GamepadIcon className='w-6 h-6 text-cyan-400' />
                  <h3 className='text-xl font-bold text-cyan-400'>UPGRADES_SHOP</h3>
                </div>
                <div className='space-y-4 max-h-96 overflow-y-auto pr-2'>
                  {shopItems.map((item) => {
                    const owned = ownedItems[item.id] || 0;
                    const affordable = canAfford(item.id);
                    return (
                      <div key={item.id} className='border border-green-400 p-4'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h4 className='font-bold text-cyan-400 text-sm'>{item.name}</h4>
                            <p className='text-xs text-green-400'>
                              +{item.clickMultiplier ? item.clickMultiplier : item.passiveIncome} {item.clickMultiplier ? 'PER DOT' : 'PER SEC'}
                            </p>
                          </div>
                          {owned > 0 && (
                            <Badge className='bg-green-400 text-black text-xs'>{owned}</Badge>
                          )}
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-yellow-400 font-bold text-sm'>{item.baseCost} POINTS</span>
                          <Button
                            size='sm'
                            onClick={() => buyItem(item.id)}
                            disabled={!affordable}
                            className={`font-mono text-xs ${affordable ? 'bg-green-400 text-black hover:bg-cyan-400' : 'bg-gray-600 text-gray-400'}`}
                          >
                            <Plus className='w-3 h-3 mr-1' />
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
        title={loadingTitle}
        description={loadingDescription}
        transactionText={loadingTransactionText}
      />
    </div>
  );
};

export default PacMan;