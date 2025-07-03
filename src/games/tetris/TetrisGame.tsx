import { useCallback, useEffect, useState, useMemo } from 'react';
import { useGame, GameProvider } from './context';
import Board from './components/Board';
import GameMenu from './components/GameMenu';
import HelpSidebar from './components/HelpSidebar';
import SplashScreen from './components/SplashScreen';
import HoldPiece from './components/HoldPiece';
import NextPieces from './components/NextPieces';
import BackButton from './components/BackButton';
import useWalletStore from '../../stores/useWalletStore';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { GameState } from './types';
import { useNavigate } from 'react-router-dom';
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
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  // Default controls
  const defaultControls = useMemo<ControlSettings>(() => ({
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotate: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    hold: 'KeyC',
    pause: 'KeyP'
  }), []);

  // Load controls from localStorage or use defaults
  const [controls, setControls] = useLocalStorage<ControlSettings>('tetris-controls', defaultControls);
  
  // Merge with defaults to ensure all controls are set
  const effectiveControls = useCallback(() => ({
    ...defaultControls,
    ...controls
  }), [controls, defaultControls]);

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

    const currentControls = effectiveControls();
    
    // Handle both key and code for better compatibility
    const key = e.key || e.code;
    const code = e.code;

    // Check if any control matches either the key or code
    if (key === currentControls.rotate || code === currentControls.rotate) {
      e.preventDefault();
      dispatch({ type: 'ROTATE' });
    } else if (key === currentControls.moveLeft || code === currentControls.moveLeft) {
      e.preventDefault();
      dispatch({ type: 'MOVE_LEFT' });
    } else if (key === currentControls.moveRight || code === currentControls.moveRight) {
      e.preventDefault();
      dispatch({ type: 'MOVE_RIGHT' });
    } else if (key === currentControls.softDrop || code === currentControls.softDrop) {
      e.preventDefault();
      dispatch({ type: 'SOFT_DROP' });
    } else if (key === currentControls.hardDrop || code === currentControls.hardDrop || 
               (code === 'Space' && key === ' ')) {
      e.preventDefault();
      dispatch({ type: 'HARD_DROP' });
    } else if (key === currentControls.hold || code === currentControls.hold) {
      e.preventDefault();
      dispatch({ type: 'HOLD' });
    } else if (key === currentControls.pause || code === currentControls.pause || 
               (code === 'KeyP' && key.toLowerCase() === 'p')) {
      e.preventDefault();
      const currentStatus = getGameStatus();
      if (currentStatus === 'playing') {
        dispatch({ type: 'PAUSE' });
      } else if (currentStatus === 'paused') {
        dispatch({ type: 'RESET' });
      }
    }
  }, [dispatch, effectiveControls, getGameStatus]);

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
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {showSplash ? (
        <SplashScreen
          message="Loading TETRIS..."
          duration={2500}
          onComplete={() => setShowSplash(false)}
        />
      ) : (
        <div className="flex flex-col h-full w-full">
          {/* Top Bar - Mobile */}
          <div className="lg:hidden bg-gray-900/90 backdrop-blur-sm p-3 border-b border-gray-800 flex justify-between items-center">
            <BackButton 
              onClick={() => navigate('/')}
              className="text-sm px-3 py-1.5"
            />
            <div className="flex items-center space-x-4">
              <div className="text-white font-mono text-sm">
                <span className="text-gray-400">Score: </span>
                {state.stats.score.toLocaleString()}
              </div>
              <button
                onClick={() => setShowHelp(true)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
                aria-label="Help"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Desktop */}
            <div className="hidden lg:flex flex-col w-56 xl:w-64 bg-gray-900/80 border-r border-gray-800 p-4 space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Hold</h3>
                <div className="flex justify-center min-h-[80px]">
                  <HoldPiece />
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Controls</h3>
                <div className="space-y-2.5 text-sm text-gray-300">
                  {[
                    { label: 'Move Left', key: controls.moveLeft },
                    { label: 'Move Right', key: controls.moveRight },
                    { label: 'Rotate', key: controls.rotate },
                    { label: 'Soft Drop', key: controls.softDrop },
                    { label: 'Hard Drop', key: controls.hardDrop },
                    { label: 'Hold', key: controls.hold },
                    { label: 'Pause', key: controls.pause }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-gray-700/50">
                      <span className="text-gray-300">{item.label}</span>
                      <kbd className="px-2.5 py-1 bg-gray-700/80 rounded-md text-xs font-mono">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
              <div className="relative w-full max-w-md mx-auto">
                <div className="aspect-square w-full max-h-[90vh] flex items-center justify-center">
                  <Board />
                </div>
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
                    onQuit={() => navigate('/')}
                  />
                )}
              </div>
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="hidden lg:flex flex-col w-56 xl:w-64 bg-gray-900/80 border-l border-gray-800 p-4 space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Next</h3>
                <div className="space-y-4">
                  <NextPieces count={3} />
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Stats</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Score', value: state.stats.score.toLocaleString() },
                    { label: 'Level', value: state.stats.level },
                    { label: 'Lines', value: state.stats.lines }
                  ].map((stat, index) => (
                    <div key={index} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-gray-700/50">
                      <span className="text-xs text-gray-400">{stat.label}</span>
                      <span className="text-white font-mono text-sm">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Bar */}
          <div className="lg:hidden bg-gray-900/90 backdrop-blur-sm p-3 border-t border-gray-800 grid grid-cols-3 gap-2">
            <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">Hold</span>
              <div className="h-8 flex items-center">
                <HoldPiece />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">Level</span>
              <span className="text-white font-mono text-lg">{state.stats.level}</span>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">Lines</span>
              <span className="text-white font-mono text-lg">{state.stats.lines}</span>
            </div>
          </div>

          {/* Help Sidebar */}
          <HelpSidebar
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            controls={controls}
          />
        </div>
      )}
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
