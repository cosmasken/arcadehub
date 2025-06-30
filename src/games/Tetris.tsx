import React, { useEffect, useRef, useState, useCallback } from 'react';

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK = 24;
const GAME_SPEED = 1000; // ms

// Colors for each tetromino type
const COLORS = [
  '#000000',  // empty
  '#00FFFF',  // I - Cyan
  '#0000FF',  // J - Blue
  '#FFA500',  // L - Orange
  '#FFFF00',  // O - Yellow
  '#00FF00',  // S - Green
  '#800080',  // T - Purple
  '#FF0000',  // Z - Red
];

// Tetromino shapes
const SHAPES = [
  [],
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]], // Z
];

type Position = { x: number; y: number };
type Tetromino = number[][];

// Create a blank board
const createBoard = (): number[][] => 
  Array(ROWS).fill(0).map(() => Array(COLS).fill(0));

// Get a random tetromino
const getRandomTetromino = (): { shape: Tetromino, type: number } => {
  const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
  return { shape: JSON.parse(JSON.stringify(SHAPES[type])), type };
};

// Rotate a tetromino
const rotate = (matrix: Tetromino): Tetromino => {
  const N = matrix.length;
  const result = Array(N).fill(0).map(() => Array(N).fill(0));
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      result[x][N - 1 - y] = matrix[y][x];
    }
  }
  
  return result;
};

const Tetris: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state refs
  const boardRef = useRef(createBoard());
  const currentRef = useRef<{ shape: Tetromino; x: number; y: number; type: number } | null>(null);
  const dropStartRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const lastDropTimeRef = useRef(0);

  // Create a new tetromino
  const newPiece = useCallback(() => {
    const { shape, type } = getRandomTetromino();
    currentRef.current = {
      shape,
      x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
      y: 0,
      type,
    };

    // Check for game over
    if (collides()) {
      setGameOver(true);
    }
  }, [collides]);

  // Check for collisions
  const collides = useCallback((): boolean => {
    if (!currentRef.current) return false;

    const { shape, x, y } = currentRef.current;

    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx] === 0) continue;

        const newX = x + dx;
        const newY = y + dy;

        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && boardRef.current[newY][newX])
        ) {
          return true;
        }
      }
    }

    return false;
  }, []);

  // Merge the current piece into the board
  const merge = useCallback(() => {
    if (!currentRef.current) return;

    const { shape, x, y, type } = currentRef.current;

    shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const newY = y + dy;
          if (newY >= 0) {
            boardRef.current[newY][x + dx] = type;
          }
        }
      });
    });
  }, []);

  // Clear completed lines and update score
  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = [...boardRef.current];

    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++; // Check the same row again
      }
    }

    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200][linesCleared];
      setScore(prev => prev + points);
      boardRef.current = newBoard;
    }
  }, []);

  // Move the current piece
  const move = useCallback((dx: number, dy: number) => {
    if (!currentRef.current || gameOver || isPaused) return false;

    currentRef.current.x += dx;
    currentRef.current.y += dy;

    if (collides()) {
      currentRef.current.x -= dx;
      currentRef.current.y -= dy;

      if (dy > 0) {
        merge();
        clearLines();
        newPiece();
      }
      return false;
    }
    return true;
  }, [clearLines, collides, gameOver, isPaused, merge, newPiece]);

  // Rotate the current piece
  const rotatePiece = useCallback(() => {
    if (!currentRef.current || gameOver || isPaused) return;

    const originalShape = currentRef.current.shape;
    currentRef.current.shape = rotate(currentRef.current.shape);

    if (collides()) {
      currentRef.current.shape = originalShape;
    }
  }, [collides, gameOver, isPaused]);

  // Drop the current piece
  const drop = useCallback(() => {
    if (gameOver || isPaused) return;
    
    const now = Date.now();
    const delta = now - lastDropTimeRef.current;
    
    if (delta > GAME_SPEED) {
      move(0, 1);
      lastDropTimeRef.current = now;
    }
  }, [gameOver, isPaused, move]);

  // Reset the game
  const resetGame = useCallback(() => {
    boardRef.current = createBoard();
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    newPiece();
    dropStartRef.current = Date.now();
  }, [newPiece]);

  // Start the game
  const startGame = useCallback(() => {
    resetGame();
    setGameStarted(true);
  }, [resetGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        startGame();
        return;
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          move(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameStarted, isPaused, move, resetGame, rotatePiece, startGame]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      if (!isPaused) {
        drop();
        renderGame();
      }
    }, 16); // ~60fps

    gameLoopRef.current = gameLoop as unknown as number;
    return () => clearInterval(gameLoop);
  }, [drop, gameOver, gameStarted, isPaused, renderGame]);

  // Render the game
  const renderGame = useCallback(() => {
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
    
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK, 0);
      ctx.lineTo(i * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK);
      ctx.lineTo(COLS * BLOCK, i * BLOCK);
      ctx.stroke();
    }

    // Draw the board
    boardRef.current.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
        }
      });
    });

    // Draw the current piece
    if (currentRef.current) {
      const { shape, x, y, type } = currentRef.current;
      shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value) {
            ctx.fillStyle = COLORS[type];
            ctx.fillRect(
              (x + dx) * BLOCK + 1,
              (y + dy) * BLOCK + 1,
              BLOCK - 2,
              BLOCK - 2
            );
          }
        });
      });
    }

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
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

    // Draw pause message
    if (isPaused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
      ctx.font = '16px Arial';
      ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 30);
    }
  }, [score, gameOver, isPaused]);

  // Initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;

    // Initial render
    renderGame();
  }, [renderGame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">Tetris</h1>
      
      {!gameStarted ? (
        <div className="text-center mb-4">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Start Game
          </button>
          <div className="text-gray-300 text-sm">
            <p>Use arrow keys to control the tetromino</p>
            <p>Up: Rotate | Down: Move Down | Space: Pause | R: Restart</p>
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
          width={COLS * BLOCK}
          height={ROWS * BLOCK}
          className="border-2 border-gray-700 rounded"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-white mb-4">Tetris</h2>
              <p className="text-gray-300 mb-4">Use arrow keys to control the tetromino</p>
              <p className="text-gray-300">Press any key to start</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-gray-400 text-sm text-center">
        <p>Controls: ↑ Rotate | ↓ Move Down | ← → Move | SPACE Pause | R Restart</p>
      </div>
    </div>
  );
};

export default Tetris;