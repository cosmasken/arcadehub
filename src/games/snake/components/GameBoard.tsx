import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { useGameState } from '../context/GameStateContext';
import { GRID_SIZE } from '../constants';
import GameMenu from './GameMenu';
import SplashScreen from './SplashScreen';

const GameBoard: React.FC = () => {
  const { state, dispatch, changeDirection } = useGame();
  const { state: gameState } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Toggle pause with 'p' key
    if (e.key.toLowerCase() === 'p' && state.isStarted && !state.gameOver) {
      dispatch({ type: 'PAUSE_GAME', isPaused: !state.isPaused });
      return;
    }

    const useWASD = gameState.settings.useWASD;

    if (useWASD) {
      switch (e.key.toLowerCase()) {
        case 'w':
          changeDirection('UP');
          break;
        case 's':
          changeDirection('DOWN');
          break;
        case 'a':
          changeDirection('LEFT');
          break;
        case 'd':
          changeDirection('RIGHT');
          break;
        default:
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
          changeDirection('UP');
          break;
        case 'ArrowDown':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
          changeDirection('RIGHT');
          break;
        default:
          break;
      }
    }
  }, [changeDirection, gameState.settings.useWASD]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle window resize and canvas setup
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40; // Account for padding
        const size = Math.min(containerWidth, containerHeight, 800); // Max size of 800px
        const cellSize = Math.floor(size / GRID_SIZE);
        const width = cellSize * GRID_SIZE;
        const height = cellSize * GRID_SIZE;

        // Set canvas dimensions
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Update state for any components that need to know the dimensions
        setDimensions({ width, height });
      }
    };

    // Initial setup
    updateCanvasSize();

    // Handle window resize with debounce
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCanvasSize, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Draw food on the canvas
  const drawFood = (ctx: CanvasRenderingContext2D, food: { x: number; y: number }) => {
    if (!canvasRef.current) return;
    const cellSize = canvasRef.current.width / GRID_SIZE;

    // Draw food with a gradient
    const gradient = ctx.createRadialGradient(
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      0,
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      cellSize * 0.8
    );

    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ff0000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.5) * cellSize,
      (food.y + 0.5) * cellSize,
      cellSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(
      (food.x + 0.3) * cellSize,
      (food.y + 0.3) * cellSize,
      cellSize * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Game rendering loop
  const render = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw the grid with a dark theme and neon effect
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.05)';
    ctx.lineWidth = 0.5;

    // Draw a subtle gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, canvasRef.current.height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#0a1a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const cellSize = canvasRef.current.width / GRID_SIZE;

    // Draw grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasRef.current.height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasRef.current.width, i * cellSize);
      ctx.stroke();
    }

    // Draw obstacles (walls) with a distinct style
    if (state.obstacles && state.obstacles.length > 0) {
      state.obstacles.forEach(obstacle => {
        ctx.save();
        ctx.shadowColor = '#d946ef'; // Neon purple shadow
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#a21caf'; // Bold neon purple
        ctx.strokeStyle = '#f0abfc'; // Light purple border
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
          obstacle.x * cellSize + 2,
          obstacle.y * cellSize + 2,
          cellSize - 4,
          cellSize - 4,
          cellSize * 0.25
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(
      (state.food.x + 0.5) * cellSize,
      (state.food.y + 0.5) * cellSize,
      cellSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake with smooth transitions
    state.snake.forEach((segment, index) => {
      // Calculate position with sub-cell offset
      const renderX = (segment.x + segment.dx) * cellSize;
      const renderY = (segment.y + segment.dy) * cellSize;
      
      // Head is a different color
      if (index === 0) {
        // Head color with glow effect
        const gradient = ctx.createRadialGradient(
          renderX + cellSize / 2,
          renderY + cellSize / 2,
          0,
          renderX + cellSize / 2,
          renderY + cellSize / 2,
          cellSize * 0.8
        );
        gradient.addColorStop(0, '#2ed573');
        gradient.addColorStop(1, '#1a8a3a');
        ctx.fillStyle = gradient;
      } else {
        // Body color with slight gradient
        const intensity = 200 - Math.min(150, index * 2);
        ctx.fillStyle = `rgba(46, 213, 115, ${intensity / 255})`;
      }

      // Draw rounded rectangle for the segment
      const cornerRadius = cellSize * 0.2;
      ctx.beginPath();
      ctx.roundRect(
        renderX + 1,
        renderY + 1,
        cellSize - 2,
        cellSize - 2,
        cornerRadius
      );
      ctx.fill();

      // Add eyes to the head
      if (index === 0) {
        const eyeSize = cellSize * 0.15;
        const eyeOffsetX = cellSize * 0.25;
        const eyeOffsetY = cellSize * 0.25;
        const pupilOffset = cellSize * 0.1;
        
        // Determine eye positions based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        const direction = state.direction;
        
        if (direction === 'RIGHT' || direction === 'LEFT') {
          leftEyeX = renderX + (direction === 'RIGHT' ? cellSize * 0.6 : cellSize * 0.4);
          leftEyeY = renderY + eyeOffsetY;
          rightEyeX = leftEyeX;
          rightEyeY = renderY + cellSize - eyeOffsetY;
        } else {
          leftEyeX = renderX + eyeOffsetX;
          leftEyeY = renderY + (direction === 'DOWN' ? cellSize * 0.6 : cellSize * 0.4);
          rightEyeX = renderX + cellSize - eyeOffsetX;
          rightEyeY = leftEyeY;
        }

        // Left eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils - look in the direction of movement
        ctx.fillStyle = 'black';
        const pupilSize = eyeSize * 0.6;
        
        // Left pupil
        ctx.beginPath();
        ctx.arc(
          leftEyeX + (direction === 'LEFT' ? -pupilOffset : direction === 'RIGHT' ? pupilOffset : 0),
          leftEyeY + (direction === 'UP' ? -pupilOffset : direction === 'DOWN' ? pupilOffset : 0),
          pupilSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Right pupil
        ctx.beginPath();
        ctx.arc(
          rightEyeX + (direction === 'LEFT' ? -pupilOffset : direction === 'RIGHT' ? pupilOffset : 0),
          rightEyeY + (direction === 'UP' ? -pupilOffset : direction === 'DOWN' ? pupilOffset : 0),
          pupilSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    requestRef.current = requestAnimationFrame(render);
  }, [state]);

  // Set up the animation frame loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [render]);



  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    dispatch({ type: 'SPLASH_COMPLETE' });
    // Show start menu after splash
    dispatch({ 
      type: 'TOGGLE_MENU', 
      show: true, 
      menuType: 'start' 
    });
    // Make sure game is paused when menu is shown
    dispatch({ type: 'PAUSE_GAME', isPaused: true });
  }, [dispatch]);

  // Handle menu actions
  const handleStart = useCallback(() => {
    if (state.menuType === 'start') {
      // Start a new game - reset everything first
      dispatch({ type: 'RESET_GAME' });
      // Then start the game
      dispatch({ type: 'START' });
      // Make sure menu is hidden and game is not paused
      dispatch({ type: 'TOGGLE_MENU', show: false });
      dispatch({ type: 'PAUSE_GAME', isPaused: false });
    } else if (state.menuType === 'pause') {
      // Just resume the game - don't reset, just unpause
      dispatch({ type: 'PAUSE_GAME', isPaused: false });
      // Make sure menu is hidden
      dispatch({ type: 'TOGGLE_MENU', show: false });
    } else if (state.menuType === 'gameOver') {
      // For game over, we want to reset and start a new game
      dispatch({ type: 'RESET_GAME' });
      dispatch({ type: 'START' });
      dispatch({ type: 'TOGGLE_MENU', show: false });
      dispatch({ type: 'PAUSE_GAME', isPaused: false });
    }
  }, [state.menuType, dispatch]);

  const handleRestart = useCallback(() => {
    // Reset the game completely
    dispatch({ type: 'RESET_GAME' });
    // Start a new game immediately
    dispatch({ type: 'START' });
    // Hide menu after restart
    dispatch({ type: 'TOGGLE_MENU', show: false });
    dispatch({ type: 'PAUSE_GAME', isPaused: false });
  }, [dispatch]);

  const handleSave = useCallback(() => {
    // Save game state
    // This would be implemented to save to local storage or backend
    console.log('Game saved');
  }, []);

  const handleQuit = useCallback(() => {
    if (state.menuType === 'pause') {
      // If quitting from pause, return to main menu
      dispatch({ type: 'RETURN_TO_MENU' });
      // Show start menu
      dispatch({ 
        type: 'TOGGLE_MENU', 
        show: true, 
        menuType: 'start' 
      });
    } else {
      // If already in main menu, just close the menu
      dispatch({ type: 'TOGGLE_MENU', show: false });
    }
  }, [state.menuType, dispatch]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900 p-4">
      <div 
        ref={containerRef}
        className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center"
      >
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          className="bg-gray-800 rounded-lg shadow-lg"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            display: state.isStarted && !state.gameOver ? 'block' : 'none'
          }}
        />
        
        {/* Splash Screen - Shows during initial load */}
        {state.isLoading && (
          <SplashScreen 
            message="Loading..."
            onComplete={handleSplashComplete} 
          />
        )}
        
        {/* Game Menu - Shows when game is not started or is paused/over */}
        {!state.isLoading && !gameState.ui.showLoginPrompt && (
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            !state.isStarted || state.showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <GameMenu 
              type={state.menuType === 'levelComplete' ? 'levelComplete' : state.gameOver ? 'gameOver' : state.isPaused ? 'pause' : 'start'}
              score={state.score}
              highScore={state.highScore}
              level={state.level}
              onStart={handleStart}
              onRestart={handleRestart}
              onSave={handleSave}
              onQuit={handleQuit}
              onNextLevel={() => {
                dispatch({ type: 'NEXT_LEVEL' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
