import { useCallback, useEffect, useState } from 'react';
import { useGame, GameProvider } from './context';
import Board from './components/Board';
import GameMenu from './components/GameMenu';
import HelpSidebar from './components/HelpSidebar';
import useWalletStore from '../../stores/useWalletStore';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { GameState } from './types';

// Local game status for the UI
enum GameStatus {
  START = 'start',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver'
}

interface ControlSettings {
  moveLeft: string;
  moveRight: string;
  rotate: string;
  softDrop: string;
  hardDrop: string;
  hold: string;
  pause: string;
}

// Separate GameUI component that uses the hooks
const GameUI: React.FC = () => {
  const { state, dispatch } = useGame();
  const [showHelp, setShowHelp] = useState(false);

  // Load controls from localStorage or use defaults
  const [controls, setControls] = useLocalStorage<ControlSettings>('tetris-controls', {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotate: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    hold: 'KeyC',
    pause: 'KeyP'
  });

  // Determine game status based on state
  const getGameStatus = useCallback((): 'start' | 'playing' | 'paused' | 'gameOver' => {
    if (state.gameOver) return 'gameOver';
    if (state.isPaused) return 'paused';
    return state.isStarted ? 'playing' : 'start';
  }, [state.gameOver, state.isPaused, state.isStarted]);

  // Handle keyboard input based on current controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const gameStatus = getGameStatus();
    if (gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) {
      return;
    }

    switch (e.code) {
      case controls.moveLeft:
        e.preventDefault();
        dispatch({ type: 'MOVE_LEFT' });
        break;
      case controls.moveRight:
        e.preventDefault();
        dispatch({ type: 'MOVE_RIGHT' });
        break;
      case controls.rotate:
        e.preventDefault();
        dispatch({ type: 'ROTATE' });
        break;
      case controls.softDrop:
        e.preventDefault();
        dispatch({ type: 'SOFT_DROP' });
        break;
      case controls.hardDrop:
        e.preventDefault();
        dispatch({ type: 'HARD_DROP' });
        break;
      case controls.hold:
        e.preventDefault();
        dispatch({ type: 'HOLD' });
        break;
      case controls.pause: {
        e.preventDefault();
        const currentStatus = getGameStatus();
        if (currentStatus === 'playing') {
          dispatch({ type: 'PAUSE' });
        } else if (currentStatus === 'paused') {
          dispatch({ type: 'RESET' });
        }
        break;
      }
    }
  }, [dispatch, controls, getGameStatus]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const [highScore, setHighScore] = useLocalStorage('tetris-highscore', 0);
  const { isConnected } = useWalletStore();

  // Effects
  useEffect(() => {
    if (state.gameOver && state.stats.score > highScore) {
      setHighScore(state.stats.score);
    }
  }, [state.gameOver, state.stats.score, highScore, setHighScore]);

  useEffect(() => {
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const currentStatus = getGameStatus();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gray-900">
      <Board />
      {currentStatus !== 'playing' && (
        <GameMenu
          type={currentStatus === 'paused' ? 'pause' : currentStatus === 'gameOver' ? 'gameOver' : 'start'}
          score={state.stats.score}
          highScore={state.stats.highScore}
          level={state.stats.level}
          onStart={() => {
            if (currentStatus === GameStatus.START) {
              dispatch({ type: 'START_GAME' });
            } else {
              dispatch({ type: 'RESET' });
            }
          }}
          onResume={() => dispatch({ type: 'RESET' })}
          onRestart={() => {
            dispatch({ type: 'RESET_GAME' });
            dispatch({ type: 'START_GAME' });
          }}
          onQuit={() => {
            // Handle quit to menu
            window.location.href = '/games';
          }}
        />
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        aria-label="Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Help Sidebar */}
      <HelpSidebar
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        controls={controls}
      />
    </div>
  );
};

// Main TetrisGame component wrapped with GameProvider
const TetrisGame: React.FC = () => {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
};

export default TetrisGame;
