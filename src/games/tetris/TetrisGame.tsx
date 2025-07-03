import React, { useEffect, useState, useCallback } from 'react';
import { useGame, GameProvider } from './context';
import { Board, Stats, Shop, Achievements } from './components';
import SplashScreen from './components/SplashScreen';
import GameMenu from './components/GameMenu';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import useWalletStore from '../../stores/useWalletStore';

// Inner component to handle game UI
const GameUI: React.FC = () => {
  // State hooks
  const { state, dispatch } = useGame();
  const [showSplash, setShowSplash] = useState(true);
  const [highScore, setHighScore] = useLocalStorage('tetris-highscore', 0);
  const { isConnected, connect } = useWalletStore();
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Memoized callbacks
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);
  
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
  
  const toggleShop = useCallback(() => {
    setShowShop(prev => !prev);
    setShowAchievements(false);
    setShowControls(false);
  }, []);

  const toggleAchievements = useCallback(() => {
    setShowAchievements(prev => !prev);
    setShowShop(false);
    setShowControls(false);
  }, []);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
    setShowShop(false);
    setShowAchievements(false);
  }, []);
  
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
    return <SplashScreen onComplete={handleSplashComplete} />;
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

      <div className="h-full flex flex-col pt-16 px-4">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TETRIS
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">Clear lines and get the highest score!</p>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4 h-full min-w-[200px] max-w-[300px]">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-400/20">
              <h3 className="font-bold text-blue-400 text-sm mb-3">GAME STATS</h3>
              <Stats />
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-400/20">
              <h3 className="font-bold text-blue-400 text-sm mb-3">QUICK ACTIONS</h3>
              <div className="space-y-2">
                <button
                  onClick={toggleShop}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  🛒 SHOP
                </button>
                <button
                  onClick={toggleAchievements}
                  className="w-full px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  🏆 ACHIEVEMENTS
                </button>
                <button
                  onClick={toggleControls}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  🎮 CONTROLS
                </button>
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-6 xl:col-span-8 h-full">
            <div 
              className="bg-black/30 rounded-lg shadow-lg overflow-hidden h-full flex items-center justify-center border border-blue-400/20"
              style={{ filter: showShop || showAchievements || showControls ? 'blur(2px)' : 'none' }}
            >
              <div className="w-full max-w-md">
                <Board />
              </div>
              
              {/* Game Menu Overlay */}
              {(!state.isStarted || state.isPaused || state.gameOver) && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
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

          {/* Right Sidebar - Shop, Achievements, Controls */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4 h-full min-w-[200px] max-w-[300px]">
            {showShop && (
              <div className="bg-gray-800/90 p-4 rounded-lg border border-purple-500/30 h-full overflow-y-auto">
                <h3 className="font-bold text-purple-400 text-lg mb-3">SHOP</h3>
                <Shop />
              </div>
            )}
            
            {showAchievements && (
              <div className="bg-gray-800/90 p-4 rounded-lg border border-yellow-500/30 h-full overflow-y-auto">
                <h3 className="font-bold text-yellow-400 text-lg mb-3">ACHIEVEMENTS</h3>
                <Achievements />
              </div>
            )}
            
            {showControls && (
              <div className="bg-gray-800/90 p-4 rounded-lg border border-blue-500/30 h-full overflow-y-auto">
                <h3 className="font-bold text-blue-400 text-lg mb-3">CONTROLS</h3>
                <div className="space-y-3 text-sm text-gray-200">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd>
                    <span>Move piece</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd>
                    <span>Rotate piece</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd>
                    <span>Soft drop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd>
                    <span>Hard drop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">C</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">Shift</kbd>
                    <span>Hold piece</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-700 px-2 py-1 rounded">P</kbd>
                    <span>Pause game</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main game component
const TetrisGame: React.FC = () => {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
};

export default TetrisGame;
  