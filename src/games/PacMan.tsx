import React, { useEffect, useRef, useState, useCallback } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150; // ms

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 5, y: 5 });
  const gameLoopRef = useRef<number>();
  const nextDirectionRef = useRef<Direction>('RIGHT');

  // Generate random food position
  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Make sure food doesn't spawn on snake
    const isOnSnake = snakeRef.current.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    );
    
    return isOnSnake ? generateFood() : newFood;
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    foodRef.current = generateFood();
    setScore(0);
    setGameOver(false);
  }, [generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        setGameStarted(true);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') nextDirectionRef.current = 'RIGHT';
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
        case 'r':
        case 'R':
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, resetGame]);

  // Memoize the renderGame function to prevent unnecessary re-renders
  const memoizedRenderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snakeRef.current.forEach((segment, index) => {
      // Make the head a different color
      if (index === 0) {
        ctx.fillStyle = '#2E7D32';
      } else {
        ctx.fillStyle = '#4CAF50';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Draw game over message
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText(
        `Final Score: ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 10
      );
      ctx.fillText(
        'Press R to restart',
        canvas.width / 2,
        canvas.height / 2 + 40
      );
    }
  }, [score, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const moveSnake = () => {
      const snake = [...snakeRef.current];
      const head = { ...snake[0] };
      
      // Update direction
      directionRef.current = nextDirectionRef.current;

      // Move head
      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check for collisions with walls
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check for collisions with self
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      // Add new head
      snake.unshift(head);

      // Check for food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(prev => prev + 10);
        foodRef.current = generateFood();
      } else {
        // Remove tail if no food was eaten
        snake.pop();
      }

      snakeRef.current = snake;
    };

    const gameLoop = setInterval(() => {
      if (!gameOver) {
        moveSnake();
        memoizedRenderGame();
      } else {
        clearInterval(gameLoop);
      }
    }, GAME_SPEED);

    gameLoopRef.current = gameLoop as unknown as number;
    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, gameStarted, generateFood, memoizedRenderGame]);



  // Initial render and game state changes
  useEffect(() => {
    memoizedRenderGame();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Any cleanup if needed
    };
  }, [memoizedRenderGame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-green-500 mb-4">Snake Game</h1>
      
      {!gameStarted ? (
        <div className="text-center mb-4">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-4"
          >
            Start Game
          </button>
          <div className="text-gray-300 text-sm">
            <p>Use arrow keys to control the snake</p>
            <p>Eat the red food to grow and earn points</p>
            <p>Press SPACE to pause/resume</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex justify-between w-full max-w-md">
          <div className="text-white">Score: {score}</div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      )}
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-gray-700 rounded"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-white mb-4">Snake Game</h2>
              <p className="text-gray-300 mb-4">Use arrow keys to control the snake</p>
              <p className="text-gray-300">Eat the red food to grow</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-gray-400 text-sm text-center">
        <p>Controls: Arrow Keys to move | SPACE to pause | R to restart</p>
      </div>
    </div>
  );
};

export default SnakeGame;