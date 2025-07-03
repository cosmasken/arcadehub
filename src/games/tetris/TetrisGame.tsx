import React, { useEffect, useState, useCallback } from 'react';
import { useGame } from './context';
import { GameProvider } from './context';
import { Board, Stats, Shop, Achievements } from './components';
import SplashScreen from './components/SplashScreen';
import GameMenu from './components/GameMenu';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// Create a simple GameStateProvider since we don't have the actual one
const GameStateProvider: React.FC<{ children: React.ReactNode; initialState: GameState }> = ({ children, initialState }) => {
  return <>{children}</>;
};

// Temporary type definition for GameState until we import it properly
type GameState = {
  score: number;
  level: number;
  isStarted: boolean;
  isPaused: boolean;
  gameOver: boolean;
  stats: {
    score: number;
    level: number;
    linesCleared: number;
  };
};

// Inner component to handle game UI
const GameUI: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showSplash, setShowSplash] = useState(true);
  const [highScore, setHighScore] = useLocalStorage('tetris-highscore', 0);
  
  // Update high score if current score is higher
  useEffect(() => {
    if (state.gameOver && state.stats.score > highScore) {
      setHighScore(state.stats.score);
    }
  }, [state.gameOver, state.stats.score, highScore, setHighScore]);
  
  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);
  
  // Game control handlers
  const handleStartGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, [dispatch]);
  
  const handleResumeGame = useCallback(() => {
    dispatch({ type: 'PAUSE', isPaused: false });
  }, [dispatch]);
  
  const handleRestartGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'START_GAME' });
  }, [dispatch]);
  
  const handleQuitGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);
  
  // Determine menu type based on game state
  const getMenuType = () => {
    if (!state.isStarted) return 'start';
    if (state.isPaused) return 'pause';
    if (state.gameOver) return 'gameOver';
    return null;
  };
  
  // Prevent page scrolling and touch events when game is mounted
  useEffect(() => {
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Game Board */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Board />
      </div>
      
      {/* Stats Panel - Only show when game is in progress */}
      {state.isStarted && !state.isPaused && !state.gameOver && (
        <div className="absolute right-4 top-4">
          <Stats />
        </div>
      )}
      
      {/* Game Menu */}
      {!state.isStarted || state.isPaused || state.gameOver ? (
        <GameMenu
          type={getMenuType()}
          score={state.stats.score}
          highScore={highScore}
          level={state.stats.level}
          onStart={handleStartGame}
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onQuit={handleQuitGame}
        />
      ) : null}
      
      {/* Shop and Achievements */}
      <Shop />
      <Achievements />
      
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Games
      </button>
    </div>
  );
};

// Main game component
const TetrisGame: React.FC = () => {
  return (
    <GameProvider>
      <GameStateProvider initialState={getInitialState()}>
        <GameUI />
      </GameStateProvider>
    </GameProvider>
  );
};

export default TetrisGame;
  