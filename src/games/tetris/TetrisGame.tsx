import { useCallback, useEffect, useState } from 'react';
import { useGame } from './context';
import Board from './components/Board';
import GameMenu from './components/GameMenu';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import useWalletStore from '../../stores/useWalletStore';

// Inner component to handle game UI
const GameUI: React.FC = () => {
  // State hooks
  const { state, dispatch } = useGame();
  const [showSplash, setShowSplash] = useState(true);
  const [highScore, setHighScore] = useLocalStorage('tetris-highscore', 0);
  const { isConnected } = useWalletStore();
  
  // Memoized callbacks
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    // Initialize game when splash is complete
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);
  
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
    // Reset game state
    dispatch({ type: 'RESET_GAME' });
    // Navigate back to the main menu
    window.location.href = '/games';
  }, [dispatch]);
  
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

  // Helper functions
  const getMenuType = () => {
    if (!state.isStarted) return 'start';
    if (state.isPaused) return 'pause';
    if (state.gameOver) return 'gameOver';
    return null;
  };

  const handleBack = () => {
    window.history.back();
  };

  // Show splash screen on initial load
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">TETRIS</h1>
          <button 
            onClick={handleSplashComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute top-4 left-4">
        <button
          onClick={handleBack}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Menu
        </button>
      </div>

      <div className="h-full flex flex-col pt-4 pb-4 px-4">
        <header className="text-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TETRIS
          </h1>
          <p className="text-xs md:text-sm text-gray-400">Clear lines and get the highest score!</p>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 h-[calc(100vh-100px)]">
          {/* Main Game Area */}
          <div className="lg:col-span-12 h-full flex items-center justify-center p-4">
            <div className="relative">
              <div 
                className="bg-black/30 rounded-lg shadow-lg overflow-hidden border border-blue-400/20"
                style={{ 
                  width: 'fit-content',
                  height: 'fit-content',
                  maxHeight: '90vh',
                  maxWidth: '100%'
                }}
              >
                <Board />
              </div>
              
              {/* Game Menu Overlay */}
              {(!state.isStarted || state.isPaused || state.gameOver) && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main game component
const TetrisGame: React.FC = () => {
  return <GameUI />;
};

export default TetrisGame;
  