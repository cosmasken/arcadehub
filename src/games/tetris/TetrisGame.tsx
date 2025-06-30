import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useGame } from './context';
import { COLS, ROWS, BLOCK, COLORS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS, SHAPES } from './constants';
import { GameAction, ShopItem, Achievement } from './types';

// Game board component
const Board: React.FC = () => {
  const { state, dispatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTick = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const size = Math.min(
          canvasRef.current.parentElement.clientWidth - 40,
          (window.innerHeight - 200) * 0.8
        );
        setDimensions({
          width: size,
          height: size * (ROWS / COLS),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game loop
  useEffect(() => {
    if (state.gameOver || state.isPaused || !state.isStarted) return;

    const gameLoop = (timestamp: number) => {
      const delta = timestamp - lastTick.current;
      const currentLevel = LEVELS.find(lvl => lvl.level === state.stats.level) || LEVELS[0];
      const speed = currentLevel.speed;

      if (delta > speed) {
        lastTick.current = timestamp;
        dispatch({ type: 'TICK' });
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTick.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.gameOver, state.isPaused, state.isStarted, state.stats.level, dispatch]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    state.board.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          drawBlock(ctx, x, y, value);
        }
      });
    });

    // Draw current piece
    if (state.currentPiece) {
      const { shape, position, type } = state.currentPiece;
      shape.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
          if (value !== 0) {
            drawBlock(
              ctx,
              position.x + x,
              position.y + y,
              type,
              true
            );
          }
        });
      });

      // Draw ghost piece
      if (state.settings.ghostPiece) {
        let ghostY = position.y;
        while (isValidMove(state.board, shape, {
          ...position,
          y: ghostY + 1,
        })) {
          ghostY++;
        }
        
        shape.forEach((row: number[], y: number) => {
          row.forEach((value: number, x: number) => {
            if (value !== 0) {
              drawGhostBlock(
                ctx,
                position.x + x,
                ghostY + y,
                type
              );
            }
          });
        });
      }
    }
  }, [state.board, state.currentPiece, state.settings.ghostPiece]);

  // Helper functions
  const drawBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: number,
    isCurrent = false
  ) => {
    if (!canvasRef.current) return;
    
    const blockSize = canvasRef.current.width / COLS;
    ctx.fillStyle = COLORS[type];
    
    // Draw main block
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    
    // Add highlight for current piece
    if (isCurrent) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
    }
    
    // Add 3D effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2);
    
    // Add highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(x * blockSize + 2, y * blockSize + 2, blockSize - 4, blockSize - 4);
  };

  const drawGhostBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: number
  ) => {
    if (!canvasRef.current) return;
    
    const blockSize = canvasRef.current.width / COLS;
    const alpha = 0.3;
    
    // Draw semi-transparent ghost block
    ctx.fillStyle = COLORS[type].replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    
    // Add border
    ctx.strokeStyle = COLORS[type];
    ctx.lineWidth = 1;
    ctx.strokeRect(x * blockSize + 0.5, y * blockSize + 0.5, blockSize - 1, blockSize - 1);
  };

  const isValidMove = (board: number[][], shape: number[][], position: { x: number; y: number }): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) continue;

        const newX = position.x + x;
        const newY = position.y + y;

        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && board[newY][newX] !== 0)
        ) {
          return false;
        }
      }
    }
    return true;
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.gameOver || !state.isStarted) return;
      
      const keyActions: Record<string, () => void> = {
        [state.settings.controls.moveLeft]: () => dispatch({ type: 'MOVE_LEFT' }),
        [state.settings.controls.moveRight]: () => dispatch({ type: 'MOVE_RIGHT' }),
        [state.settings.controls.rotate]: () => dispatch({ type: 'ROTATE' }),
        [state.settings.controls.softDrop]: () => dispatch({ type: 'SOFT_DROP' }),
        [state.settings.controls.hardDrop]: () => dispatch({ type: 'HARD_DROP' }),
        [state.settings.controls.hold]: () => dispatch({ type: 'HOLD' }),
        [state.settings.controls.pause]: () => dispatch({ type: 'PAUSE' }),
      };

      const action = keyActions[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameOver, state.isStarted, state.settings.controls, dispatch]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
      }}
    />
  );
};

// Next pieces preview component
const NextPieces: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 120, height: 200 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw next pieces (up to 3)
    const visiblePieces = state.settings.nextPiecesCount > 0
      ? state.nextPieces.slice(0, state.settings.nextPiecesCount)
      : [];

    visiblePieces.forEach((pieceType: number, index: number) => {
      const blockSize = 20;
      const shape = SHAPES[pieceType] || [];
      const offsetX = (canvas.width - (shape[0]?.length || 0) * blockSize) / 2;
      const offsetY = 30 + index * 60;

      // Draw piece
      shape.forEach((row: number[], y: number) => {
        row.forEach((value: number, x: number) => {
          if (value !== 0) {
            ctx.fillStyle = COLORS[pieceType] || '#FFFFFF';
            ctx.fillRect(
              offsetX + x * blockSize,
              offsetY + y * blockSize,
              blockSize - 1,
              blockSize - 1
            );
            
            // Add 3D effect
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
              offsetX + x * blockSize + 0.5,
              offsetY + y * blockSize + 0.5,
              blockSize - 1,
              blockSize - 1
            );
          }
        });
      });
    });
  }, [state.nextPieces, state.settings.nextPiecesCount]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Next</h3>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          padding: '10px',
        }}
      />
    </div>
  );
};

// Hold piece component
const HoldPiece: React.FC = () => {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.settings.holdPiece || state.holdPiece === null) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hold piece
    const pieceType = state.holdPiece;
    const shape = SHAPES[pieceType];
    const blockSize = 20;
    const offsetX = (canvas.width - (shape[0]?.length || 0) * blockSize) / 2;
    const offsetY = (canvas.height - shape.length * blockSize) / 2;

    shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[pieceType] || '#FFFFFF';
          ctx.fillRect(
            offsetX + x * blockSize,
            offsetY + y * blockSize,
            blockSize - 1,
            blockSize - 1
          );
          
          // Add 3D effect
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            offsetX + x * blockSize + 0.5,
            offsetY + y * blockSize + 0.5,
            blockSize - 1,
            blockSize - 1
          );
        }
      });
    });
  }, [state.holdPiece, state.settings.holdPiece]);

  if (!state.settings.holdPiece) return null;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Hold</h3>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          padding: '10px',
        }}
      />
    </div>
  );
};

// Stats component
const Stats: React.FC = () => {
  const { state } = useGame();
  const currentLevel = LEVELS.find(lvl => lvl.level === state.stats.level) || LEVELS[0];
  
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm text-gray-400">Score</h3>
          <p className="text-2xl font-bold">{state.stats.score.toLocaleString()}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">Level</h3>
          <p className="text-2xl font-bold">{state.stats.level}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">Lines</h3>
          <p className="text-2xl font-bold">{state.stats.linesCleared}</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">Coins</h3>
          <p className="text-2xl font-bold text-yellow-400">{state.stats.coins}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Level Progress</span>
          <span>{state.stats.linesCleared % 10}/10</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full" 
            style={{ 
              width: `${(state.stats.linesCleared % 10) * 10}%`,
              backgroundColor: currentLevel.color,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          Next: {currentLevel.name}
        </p>
      </div>
      
      {state.isPaused && (
        <div className="mt-4 p-2 bg-yellow-900 bg-opacity-50 text-yellow-200 text-center rounded">
          PAUSED
        </div>
      )}
    </div>
  );
};

// Controls component
const Controls: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const handleStart = () => {
    if (state.gameOver) {
      dispatch({ type: 'RESET' });
    }
    dispatch({ type: 'TICK' });
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={() => dispatch({ type: 'MOVE_LEFT' })}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        ← Left
      </button>
      <button
        onClick={() => dispatch({ type: 'MOVE_RIGHT' })}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Right →
      </button>
      <button
        onClick={() => dispatch({ type: 'ROTATE' })}
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Rotate ↻
      </button>
      <button
        onClick={() => dispatch({ type: 'SOFT_DROP' })}
        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Soft Drop ↓
      </button>
      <button
        onClick={() => dispatch({ type: 'HARD_DROP' })}
        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver}
      >
        Hard Drop ⬇
      </button>
      <button
        onClick={() => dispatch({ type: 'HOLD' })}
        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
        disabled={!state.isStarted || state.isPaused || state.gameOver || !state.settings.holdPiece}
      >
        Hold (C)
      </button>
      <button
        onClick={() => dispatch({ type: 'PAUSE' })}
        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded col-span-2"
        disabled={!state.isStarted || state.gameOver}
      >
        {state.isPaused ? 'Resume (P)' : 'Pause (P)'}
      </button>
      {(!state.isStarted || state.gameOver) && (
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold text-lg col-span-2"
        >
          {state.gameOver ? 'Play Again' : 'Start Game'}
        </button>
      )}
    </div>
  );
};

// Shop component
const Shop: React.FC = () => {
  const { state, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<'upgrades' | 'themes'>('upgrades');
  
  const availableItems = SHOP_ITEMS.filter((item: ShopItem) => 
    item.type === activeTab && 
    (item.maxLevel === undefined || (state.stats.inventory[item.id] || 0) < item.maxLevel)
  );

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-bold mb-4">Shop</h3>
      
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'upgrades' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('upgrades')}
        >
          Upgrades
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'themes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('themes')}
        >
          Themes
        </button>
      </div>
      
      <div className="space-y-3">
        {availableItems.length > 0 ? (
          availableItems.map((item: ShopItem) => (
            <div 
              key={item.id} 
              className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{item.icon}</span>
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => buyItem(item.id)}
                className={`px-3 py-1 rounded ${state.stats.coins >= item.price ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                disabled={state.stats.coins < item.price}
              >
                {item.price} 🪙
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No {activeTab} available. Check back later!
          </p>
        )}
      </div>
    </div>
  );
};

// Achievements component
const Achievements: React.FC = () => {
  const { state } = useGame();
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement: Achievement) => 
    state.stats.achievements.includes(achievement.id)
  );
  const lockedAchievements = ACHIEVEMENTS.filter((achievement: Achievement) => 
    !state.stats.achievements.includes(achievement.id)
  );

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-bold mb-4">Achievements</h3>
      
      <div className="space-y-3">
        {unlockedAchievements.length > 0 ? (
          <>
            <h4 className="text-sm font-medium text-green-400">Unlocked ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h4>
            {unlockedAchievements.map((achievement: Achievement) => (
              <div key={achievement.id} className="flex items-center p-3 bg-green-900 bg-opacity-30 rounded-lg">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div>
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-sm text-gray-300">{achievement.description}</p>
                  <p className="text-xs text-green-400 mt-1">+{achievement.reward} 🪙</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No achievements unlocked yet. Keep playing!
          </p>
        )}
        
        {lockedAchievements.length > 0 && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mt-6">Locked ({lockedAchievements.length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {lockedAchievements.map((achievement: Achievement) => (
                <div 
                  key={achievement.id} 
                  className="p-2 bg-gray-800 rounded-lg opacity-70"
                  title={achievement.description}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-2">🔒</span>
                    <span className="text-sm truncate">{achievement.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Game over modal
const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();
  
  if (!state.gameOver) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-red-500">Game Over</h2>
        <div className="text-center mb-6">
          <p className="text-xl">Final Score: {state.stats.score.toLocaleString()}</p>
          <p className="text-lg">Level: {state.stats.level}</p>
          <p className="text-lg">Lines: {state.stats.linesCleared}</p>
          {state.stats.score > state.stats.highScore && (
            <p className="text-yellow-400 font-bold mt-2">New High Score! 🎉</p>
          )}
        </div>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold text-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Tetris component
export const TetrisGame: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Stats />
          <HoldPiece />
          <NextPieces />
          <Controls />
        </div>
        
        {/* Main game area */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="relative">
            <Board />
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Shop />
          <Achievements />
        </div>
      </div>
      
      <GameOverModal />
    </div>
  );
};

// Export the component as default for easier imports
export default TetrisGame;
