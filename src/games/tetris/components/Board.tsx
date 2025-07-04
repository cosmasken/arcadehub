import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../context';
import { COLS, ROWS, LEVELS, COLORS } from '../constants';
import { drawBlock, drawGhostBlock } from '../utils/draw';
import { isValidMove } from '../utils/game';

const Board: React.FC = () => {
  const { state, dispatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTick = useRef<number>(0);
  // Increased cell size from 40 to 48 pixels for a bigger game area
  const cellSize = 48;
  const [dimensions] = useState({
    width: COLS * cellSize,
    height: ROWS * cellSize
  });
  const accumulatedTime = useRef<number>(0);
  const lastTime = useRef<number>(0);

  // Set up canvas dimensions on mount and handle resizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      
      const container = canvasRef.current.parentElement;
      if (!container) return;
      
      // Get the container size
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate the scale to fit the board in the container
      const scaleX = containerWidth / dimensions.width;
      const scaleY = containerHeight / dimensions.height;
      const scale = Math.min(scaleX, scaleY);
      
      // Set the canvas size to maintain aspect ratio
      const canvasWidth = Math.floor(dimensions.width * scale);
      const canvasHeight = Math.floor(dimensions.height * scale);
      
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;
      
      // Apply scaling to the canvas element
      canvasRef.current.style.width = `${canvasWidth}px`;
      canvasRef.current.style.height = `${canvasHeight}px`;
    };
    
    updateCanvasSize();
    
    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [dimensions]);

  // Render function
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.fillStyle = COLORS[0]; // Use the same color as empty cells
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines with updated cell size
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, ROWS * cellSize);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(COLS * cellSize, y * cellSize);
      ctx.stroke();
    }

    // Draw the board - ensure it's a valid 2D array before rendering
    const board = Array.isArray(state.board) ? state.board : [];
    for (let y = 0; y < ROWS; y++) {
      const row = Array.isArray(board[y]) ? board[y] : [];
      for (let x = 0; x < COLS; x++) {
        // Draw all cells, including those at the bottom and right edges
        const value = typeof row[x] === 'number' ? row[x] : 0;
        if (value !== 0) {
          drawBlock(ctx, x, y, value, cellSize);
        }
      }
    }

    // Draw ghost piece if enabled and there's a valid current piece
    if (state.settings.ghostPiece && state.currentPiece?.shape && state.currentPiece?.position) {
      const { shape, position, type } = state.currentPiece;
      const pieceType = type || 1;
      let ghostY = position.y;

      // Find the lowest valid position for the ghost piece
      while (isValidMove(
        state.board,
        shape,
        { x: position.x, y: ghostY + 1 }
      )) {
        ghostY++;
      }

      // Only draw the ghost piece if it's below the current piece
      if (ghostY > position.y) {
        for (let y = 0; y < shape.length; y++) {
          const row = Array.isArray(shape[y]) ? shape[y] : [];
          for (let x = 0; x < row.length; x++) {
            if (row[x] !== 0) {
              const posX = position.x + x;
              const posY = ghostY + y;

              // Only draw if position is within visible board
              if (posY >= 0 && posY < ROWS && posX >= 0 && posX < COLS) {
                drawGhostBlock(ctx, posX, posY, pieceType, cellSize);
              }
            }
          }
        }
      }
    }

    // Draw current piece with position validation
    if (state.currentPiece?.shape && state.currentPiece.position) {
      const { shape, position, type } = state.currentPiece;
      const pieceType = type || 1;

      for (let y = 0; y < shape.length; y++) {
        const row = Array.isArray(shape[y]) ? shape[y] : [];
        for (let x = 0; x < row.length; x++) {
          if (row[x] !== 0) {
            const posX = position.x + x;
            const posY = position.y + y;

            // Only draw if position is within visible board
            if (posY >= 0 && posY < ROWS && posX >= 0 && posX < COLS) {
              drawBlock(ctx, posX, posY, pieceType, cellSize);
            }
          }
        }
      }
    }
  }, [state.board, state.currentPiece, state.settings.ghostPiece]);

  // Keyboard event handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!state.isStarted || state.gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        dispatch({ type: 'MOVE_LEFT' });
        break;
      case 'ArrowRight':
        dispatch({ type: 'MOVE_RIGHT' });
        break;
      case 'ArrowUp':
        dispatch({ type: 'ROTATE' });
        break;
      case 'ArrowDown':
        dispatch({ type: 'SOFT_DROP' });
        break;
      case ' ':
        dispatch({ type: 'HARD_DROP' });
        break;
      case 'p':
      case 'P':
        dispatch({ type: 'PAUSE' });
        break;
      case 'c':
      case 'C':
        dispatch({ type: 'HOLD' });
        break;
      default:
        return;
    }

    // Prevent default for game controls to avoid page scrolling
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'p', 'P', 'c', 'C'].includes(e.key)) {
      e.preventDefault();
    }
  }, [dispatch, state.isStarted, state.gameOver]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Start the game automatically when the component mounts
  useEffect(() => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'START' });
  }, [dispatch]);

  // Game loop
  useEffect(() => {
    if (state.gameOver || state.isPaused || !state.isStarted) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update game state at a fixed rate
      if (state.isStarted && !state.isPaused && !state.gameOver) {
        const currentLevel = LEVELS.find(lvl => lvl.level === state.stats.level) || LEVELS[0];
        const speed = Math.max(500, currentLevel.speed);

        accumulatedTime.current += deltaTime;

        // Only process a tick if enough time has passed
        if (accumulatedTime.current >= speed) {
          dispatch({ type: 'TICK' });
          accumulatedTime.current = 0;
        }
      }

      // Always render at full frame rate for smoothness
      renderGame();

      // Continue the game loop
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.gameOver, state.isPaused, state.isStarted, state.stats.level, renderGame, dispatch]);

  // Initial render
  useEffect(() => {
    renderGame();
  }, [renderGame]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0 m-0 overflow-hidden">
      <div 
        className="relative"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: `${COLS}/${ROWS}`,
          boxSizing: 'border-box',
          padding: 0,
          margin: '0 auto',
          backgroundColor: COLORS[0],
          borderRadius: '0.5rem',
          border: '2px solid #4B5563',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            imageRendering: 'pixelated',
            backgroundColor: 'transparent',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        {state.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over</h2>
              <p className="text-white">Score: {state.stats.score}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  Back to Games
                </button>
                <button
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
        {state.isPaused && !state.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Paused</h2>
              <p className="text-white">Press P to resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;