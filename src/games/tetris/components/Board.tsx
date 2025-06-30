import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../context';
import { COLS, ROWS, LEVELS } from '../constants';
import { drawBlock, drawGhostBlock } from '../utils/draw';
import { isValidMove } from '../utils/game';

const Board: React.FC = () => {
    const { state, dispatch } = useGame();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const lastTick = useRef<number>(0);
    const [dimensions] = useState({ 
      width: COLS * 30, 
      height: ROWS * 30 
    });
    const accumulatedTime = useRef<number>(0);
    const lastTime = useRef<number>(0);
  
    // Set up canvas dimensions on mount
    useEffect(() => {
      if (canvasRef.current) {
        canvasRef.current.width = dimensions.width;
        canvasRef.current.height = dimensions.height;
      }
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
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#16213e';
      ctx.lineWidth = 0.5;
      
      // Draw the board - add null/undefined check and ensure it's a 2D array
      if (Array.isArray(state.board)) {
        state.board.forEach((row: number[], y: number) => {
          if (Array.isArray(row)) {
            row.forEach((value: number, x: number) => {
              if (value !== 0 && typeof value === 'number') {
                drawBlock(ctx, x, y, value);
              }
            });
          }
        });
      }
  
      // Draw ghost piece if enabled and there's a current piece
      if (state.settings.ghostPiece && state.currentPiece) {
        let ghostY = state.currentPiece.position.y;
        while (isValidMove(
          state.board, 
          state.currentPiece.shape, 
          { x: state.currentPiece.position.x, y: ghostY + 1 }
        )) {
          ghostY++;
        }
        
        if (ghostY > state.currentPiece.position.y) {
          state.currentPiece.shape.forEach((row: number[], y: number) => {
            row.forEach((value: number, x: number) => {
              if (value !== 0) {
                drawGhostBlock(ctx, state.currentPiece.position.x + x, ghostY + y, state.currentPiece.type);
              }
            });
          });
        }
      }
  
      // Draw current piece
      if (state.currentPiece) {
        state.currentPiece.shape.forEach((row: number[], y: number) => {
          row.forEach((value: number, x: number) => {
            if (value !== 0) {
              drawBlock(ctx, state.currentPiece.position.x + x, state.currentPiece.position.y + y, state.currentPiece.type);
            }
          });
        });
      }
    }, [state.board, state.currentPiece, state.settings.ghostPiece]);
  
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
        if (!state.isPaused && !state.gameOver) {
          const currentLevel = LEVELS.find(lvl => lvl.level === state.stats.level) || LEVELS[0];
          const speed = Math.max(50, currentLevel.speed); // Ensure speed is never too fast
          
          accumulatedTime.current += deltaTime;
          
          while (accumulatedTime.current >= speed) {
            dispatch({ type: 'TICK' });
            accumulatedTime.current -= speed;
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-700 rounded-lg shadow-lg"
          width={dimensions.width}
          height={dimensions.height}
          style={{
            backgroundColor: '#1a1a2e',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
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
    );
  };
  
  export default Board;