import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Target,
  Gamepad2,
  ArrowLeft,
  ArrowRight,
  Rocket
} from 'lucide-react';

interface Enemy {
  id: number;
  x: number;
  y: number;
  destroyed: boolean;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

const SpaceInvaders = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(375);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Initialize enemies
  const initializeEnemies = useCallback(() => {
    const newEnemies: Enemy[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        newEnemies.push({
          id: row * 10 + col,
          x: 50 + col * 70,
          y: 50 + row * 60,
          destroyed: false
        });
      }
    }
    setEnemies(newEnemies);
  }, []);

  // Start new game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setPlayerX(375);
    setBullets([]);
    initializeEnemies();
    
    toast({
      title: "GAME STARTED",
      description: "Use arrow keys to move, spacebar to shoot!",
      className: "bg-green-400 text-black border-green-400",
    });
  };

  // Pause/Resume game
  const togglePause = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset game
  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLives(3);
    setPlayerX(375);
    setBullets([]);
    initializeEnemies();
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          setPlayerX(prev => Math.max(20, prev - 20));
          break;
        case 'ArrowRight':
          setPlayerX(prev => Math.min(730, prev + 20));
          break;
        case ' ':
          e.preventDefault();
          setBullets(prev => [...prev, {
            id: Date.now(),
            x: playerX + 15,
            y: 520
          }]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, playerX]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move bullets
      setBullets(prev => prev
        .map(bullet => ({ ...bullet, y: bullet.y - 5 }))
        .filter(bullet => bullet.y > 0)
      );

      // Move enemies
      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        y: enemy.y + 0.5
      })));

      // Check bullet-enemy collisions
      setBullets(prevBullets => {
        const newBullets = [...prevBullets];
        setEnemies(prevEnemies => {
          const newEnemies = [...prevEnemies];
          
          newBullets.forEach((bullet, bulletIndex) => {
            newEnemies.forEach((enemy, enemyIndex) => {
              if (!enemy.destroyed &&
                  bullet.x > enemy.x && bullet.x < enemy.x + 40 &&
                  bullet.y > enemy.y && bullet.y < enemy.y + 30) {
                newEnemies[enemyIndex] = { ...enemy, destroyed: true };
                newBullets.splice(bulletIndex, 1);
                setScore(prev => prev + 100);
              }
            });
          });
          
          return newEnemies;
        });
        
        return newBullets;
      });

      // Check if all enemies destroyed
      setEnemies(prev => {
        const activeEnemies = prev.filter(enemy => !enemy.destroyed);
        if (activeEnemies.length === 0) {
          setLevel(prevLevel => prevLevel + 1);
          setTimeout(() => initializeEnemies(), 1000);
          toast({
            title: "LEVEL COMPLETE!",
            description: `Advancing to level ${level + 1}`,
            className: "bg-cyan-400 text-black border-cyan-400",
          });
        }
        return prev;
      });

      // Check if enemies reached bottom
      setEnemies(prev => {
        const bottomReached = prev.some(enemy => !enemy.destroyed && enemy.y > 480);
        if (bottomReached) {
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setIsPlaying(false);
              if (score > highScore) {
                setHighScore(score);
                toast({
                  title: "NEW HIGH SCORE!",
                  description: `You scored ${score} points!`,
                  className: "bg-yellow-400 text-black border-yellow-400",
                });
              } else {
                toast({
                  title: "GAME OVER",
                  description: `Final score: ${score} points`,
                  variant: "destructive",
                });
              }
            }
            return newLives;
          });
          initializeEnemies();
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, level, score, highScore, initializeEnemies, toast]);

  return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <Header />
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-6xl">
            {/* Game Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cyan-400 neon-text">
                 SPACE INVADERS 
              </h1>
              <p className="text-green-400 text-lg tracking-wider">
                DEFEND_EARTH // DESTROY_ALIENS // SAVE_HUMANITY
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Game Stats */}
              <div className="lg:col-span-1">
                <Card className="game-card p-6 mb-6">
                  <h3 className="text-cyan-400 font-bold mb-4 neon-text">
                     GAME_STATS 
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-green-400 text-sm">SCORE</p>
                      <p className="text-cyan-400 text-2xl font-bold">{score.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-green-400 text-sm">HIGH SCORE</p>
                      <p className="text-yellow-400 text-xl font-bold">{highScore.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-green-400 text-sm">LEVEL</p>
                      <p className="text-cyan-400 text-xl font-bold">{level}</p>
                    </div>
                    <div>
                      <p className="text-green-400 text-sm">LIVES</p>
                      <div className="flex space-x-1">
                        {Array.from({ length: lives }, (_, i) => (
                          <Rocket key={i} className="w-5 h-5 text-red-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Controls */}
                <Card className="game-card p-6">
                  <h3 className="text-cyan-400 font-bold mb-4 neon-text">
                     CONTROLS 
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <ArrowLeft className="w-4 h-4 text-green-400" />
                      <ArrowRight className="w-4 h-4 text-green-400" />
                      <span>Move ship</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-400 text-black">SPACE</Badge>
                      <span>Shoot</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Game Area */}
              <div className="lg:col-span-3">
                <Card className="game-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyan-400 font-bold neon-text">
                       BATTLEFIELD 
                    </h3>
                    <div className="flex space-x-2">
                      {!isPlaying && !gameOver && (
                        <Button
                          onClick={startGame}
                          className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          START
                        </Button>
                      )}
                      {isPlaying && (
                        <Button
                          onClick={togglePause}
                          className="bg-yellow-400 text-black hover:bg-green-400 font-mono"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          PAUSE
                        </Button>
                      )}
                      <Button
                        onClick={resetGame}
                        className="bg-red-400 text-black hover:bg-cyan-400 font-mono"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        RESET
                      </Button>
                    </div>
                  </div>

                  {/* Game Canvas */}
                  <div 
                    className="relative bg-black border-2 border-cyan-400 mx-auto"
                    style={{ width: '800px', height: '600px' }}
                  >
                    {/* Player Ship */}
                    <div
                      className="absolute transition-all duration-100"
                      style={{ 
                        left: `${playerX}px`, 
                        bottom: '20px',
                        width: '30px',
                        height: '30px'
                      }}
                    >
                      <div className="w-8 h-8 bg-green-400 transform rotate-45 rounded-sm border border-cyan-400"></div>
                    </div>

                    {/* Enemies */}
                    {enemies.filter(enemy => !enemy.destroyed).map(enemy => (
                      <div
                        key={enemy.id}
                        className="absolute bg-red-400 border border-yellow-400 rounded"
                        style={{ 
                          left: `${enemy.x}px`, 
                          top: `${enemy.y}px`,
                          width: '40px',
                          height: '30px'
                        }}
                      />
                    ))}

                    {/* Bullets */}
                    {bullets.map(bullet => (
                      <div
                        key={bullet.id}
                        className="absolute bg-cyan-400 rounded-full"
                        style={{ 
                          left: `${bullet.x}px`, 
                          top: `${bullet.y}px`,
                          width: '4px',
                          height: '8px'
                        }}
                      />
                    ))}

                    {/* Game Over Overlay */}
                    {gameOver && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-4xl font-bold text-red-400 mb-4 neon-text">
                            GAME OVER
                          </h2>
                          <p className="text-green-400 mb-4">Final Score: {score.toLocaleString()}</p>
                          <Button
                            onClick={startGame}
                            className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            PLAY AGAIN
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Start Game Overlay */}
                    {!isPlaying && !gameOver && enemies.length === 0 && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-4xl font-bold text-cyan-400 mb-4 neon-text">
                            READY TO BATTLE?
                          </h2>
                          <p className="text-green-400 mb-4">Click START to begin your mission</p>
                          <Button
                            onClick={startGame}
                            className="bg-green-400 text-black hover:bg-cyan-400 font-mono"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            START MISSION
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SpaceInvaders;
