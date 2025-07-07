import React, { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import GameMenu from './components/GameMenu';
import MobileControls from './components/MobileControls';
import { gameReducer } from './gameLogic';
import { createInitialGameState } from './gameState';
import { Direction } from './types';
import { GAME_STATES } from './constants';
import { checkCollision, isEntityCollision, pixelToGrid } from './utils/collision';
import { soundManager } from './utils/sounds';

const PacmanGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, dispatch] = useReducer(gameReducer, createInitialGameState());
  const [showDebug, setShowDebug] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  
  // Check for collisions between Pac-Man and game elements
  const checkGameCollisions = useCallback(() => {
    if (gameState.gameState !== GAME_STATES.PLAYING) {
      return; // Don't check collisions if not playing
    }
    
    const pacmanGridX = pixelToGrid(gameState.pacman.position.x);
    const pacmanGridY = pixelToGrid(gameState.pacman.position.y);
    
    // Check bounds
    if (pacmanGridY < 0 || pacmanGridY >= gameState.maze.length || 
        pacmanGridX < 0 || pacmanGridX >= gameState.maze[0].length) {
      return;
    }
    
    // Check collision with dots and power pellets
    const cellType = gameState.maze[pacmanGridY]?.[pacmanGridX];
    if (cellType === 2) { // Dot
      dispatch({ type: 'EAT_DOT', payload: { x: pacmanGridX, y: pacmanGridY } });
    } else if (cellType === 3) { // Power pellet
      dispatch({ type: 'EAT_POWER_PELLET', payload: { x: pacmanGridX, y: pacmanGridY } });
    }
    
    // Check collision with ghosts (only if they're not in house)
    gameState.ghosts.forEach(ghost => {
      if (!ghost.inHouse && isEntityCollision(gameState.pacman.position, ghost.position, 15)) {
        if (ghost.mode === 'scared') {
          dispatch({ type: 'EAT_GHOST', payload: ghost.id });
        } else if (ghost.mode !== 'eaten') {
          dispatch({ type: 'LOSE_LIFE' });
        }
      }
    });
  }, [gameState.gameState, gameState.pacman.position, gameState.ghosts, gameState.maze]);
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    if (gameState.gameState === GAME_STATES.PLAYING) {
      // Update game time
      dispatch({ type: 'UPDATE_GAME_TIME', payload: deltaTime });
      
      // Move Pac-Man
      dispatch({ type: 'MOVE_PACMAN' });
      
      // Update ghosts
      dispatch({ type: 'UPDATE_GHOSTS' });
      
      // Check collisions (with a small delay after game start)
      if (gameState.gameTime > 100) { // Wait 100ms after game starts
        checkGameCollisions();
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameState, gameState.gameTime, checkGameCollisions]);
  
  const handleToggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' });
    soundManager.setEnabled(!gameState.soundEnabled);
  }, [gameState.soundEnabled]);
  
  // Keyboard input handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keysRef.current.add(event.key);
    
    let direction: Direction | null = null;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'RIGHT';
        break;
      case ' ':
      case 'Escape':
      case 'p':
      case 'P':
        event.preventDefault();
        if (gameState.gameState === GAME_STATES.PLAYING) {
          dispatch({ type: 'PAUSE' });
        } else if (gameState.gameState === GAME_STATES.PAUSED) {
          dispatch({ type: 'RESUME' });
        }
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        handleToggleSound();
        break;
    }
    
    if (direction) {
      event.preventDefault();
      dispatch({ type: 'SET_DIRECTION', payload: direction });
    }
  }, [gameState.gameState, handleToggleSound]);
  
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysRef.current.delete(event.key);
  }, []);
  
  // Touch/swipe handling for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      let direction: Direction;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'RIGHT' : 'LEFT';
      } else {
        direction = deltaY > 0 ? 'DOWN' : 'UP';
      }
      
      dispatch({ type: 'SET_DIRECTION', payload: direction });
    }
    
    touchStartRef.current = null;
  }, []);
  
  // Game control handlers
  const handleStart = useCallback(() => {
    dispatch({ type: 'RESTART' });
    // Small delay to ensure state is reset before starting
    setTimeout(() => {
      dispatch({ type: 'RESUME' });
    }, 50);
  }, []);
  
  const handleResume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);
  
  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' });
    // Small delay to ensure state is reset before starting
    setTimeout(() => {
      dispatch({ type: 'RESUME' });
    }, 50);
  }, []);
  
  const handleHome = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
  const handleDirectionChange = useCallback((direction: Direction) => {
    dispatch({ type: 'SET_DIRECTION', payload: direction });
  }, []);
  
  const handleToggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);
  
  // Initialize sound system
  useEffect(() => {
    soundManager.setEnabled(gameState.soundEnabled);
    // Resume audio context on first user interaction
    const handleFirstInteraction = () => {
      soundManager.resume();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [gameState.soundEnabled]);
  
  // Effect for game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);
  
  // Effect for keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  // Effect for touch events
  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
  
  // Handle level completion
  useEffect(() => {
    if (gameState.gameState === GAME_STATES.LEVEL_COMPLETE) {
      const timer = setTimeout(() => {
        dispatch({ type: 'NEXT_LEVEL' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gameState]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Game UI */}
        <GameUI 
          gameState={gameState} 
          showDebug={showDebug}
          onToggleDebug={handleToggleDebug}
        />
        
        {/* Game Board */}
        <GameBoard 
          gameState={gameState} 
          showDebug={showDebug}
        />
        
        {/* Mobile Controls */}
        <MobileControls
          onDirectionChange={handleDirectionChange}
          isVisible={gameState.gameState === GAME_STATES.PLAYING}
        />
        
        {/* Game Menu */}
        <GameMenu
          gameState={gameState.gameState}
          score={gameState.score}
          highScore={gameState.highScore}
          level={gameState.level}
          soundEnabled={gameState.soundEnabled}
          onStart={handleStart}
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onToggleSound={handleToggleSound}
        />
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-gray-400 text-sm max-w-md">
        <p className="hidden md:block">
          Use arrow keys or WASD to move • Space/P/Escape to pause • M to toggle sound
        </p>
        <p className="md:hidden">
          Swipe or use controls to move • Tap pause button to pause
        </p>
      </div>
    </div>
  );
};

export default PacmanGame;
