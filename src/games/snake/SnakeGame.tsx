import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './context';
import { useWalletStore } from '../../stores/useWalletStore';
import { GameBoard, StatsPanel, Shop, Achievements } from './components';

// Inner component to handle game UI
const GameUI: React.FC = () => {
  const { state, startGame, pauseGame, resetGame } = useGame();
  const { isConnected, connectWallet } = useWalletStore();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);

  // Initialize game state on first render
  useEffect(() => {
    const savedState = localStorage.getItem('snake-save');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // If game was in progress, reset it to show the start screen
        if (parsedState.isStarted && !parsedState.gameOver) {
          resetGame();
        }
      } catch (e) {
        console.error('Failed to parse saved game state', e);
      }
    }
    setIsInitialized(true);
  }, [resetGame]);

  // Handle game start with auth check
  const handleStartGame = React.useCallback(async () => {
    if (!isConnected) {
      setShowLoginPrompt(true);
      return;
    }
    startGame();
  }, [isConnected, startGame]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start game with Space or Enter if not started
      if ((e.code === 'Space' || e.code === 'Enter') && !state.isStarted) {
        e.preventDefault();
        handleStartGame();
        return;
      }
      
      // Pause/Resume with P key
      if (e.code === 'KeyP') {
        e.preventDefault();
        if (state.isStarted && !state.gameOver) {
          pauseGame();
        }
      }
      
      // Reset game with R key
      if (e.code === 'KeyR') {
        e.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isStarted, state.gameOver, startGame, pauseGame, resetGame, isInitialized, handleStartGame]);
  
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-2 md:p-4 relative">
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
      
      <div className="h-full flex flex-col">
        <header className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            SNAKE GAME
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">Eat the food and grow your snake!</p>
        </header>
          
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Stats & Shop */}
          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <StatsPanel />
            <div className="flex-1 overflow-y-auto">
              <Shop />
            </div>
          </div>
          
          {/* Main Game Area */}
          <div className="lg:col-span-8 h-full">
            <div className="bg-black/30 rounded-lg shadow-lg overflow-hidden h-full flex items-center justify-center border border-cyan-400/20 relative">
              {!isInitialized ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="animate-pulse text-cyan-400">Loading...</div>
                </div>
              ) : !state.isStarted ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="text-center p-6 bg-gray-900/90 rounded-lg border border-cyan-400/30 shadow-xl">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-4">SNAKE GAME</h2>
                    <p className="text-gray-300 mb-6">Use arrow keys to move. Eat the food to grow!</p>
                    <button
                      onClick={handleStartGame}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      {state.gameOver ? 'PLAY AGAIN' : 'START GAME'}
                    </button>
                    {state.highScore > 0 && (
                      <p className="mt-4 text-sm text-gray-400">High Score: {state.highScore}</p>
                    )}
                  </div>
                </div>
              ) : null}
              {showLoginPrompt && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                  <div className="bg-gray-900/90 p-8 rounded-lg border border-cyan-400/30 max-w-sm w-full mx-4">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">SIGN IN REQUIRED</h3>
                    <p className="text-gray-300 mb-6">Please connect your wallet to start playing and earn rewards!</p>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={async () => {
                          try {
                            await connectWallet();
                            setShowLoginPrompt(false);
                            startGame();
                          } catch (error) {
                            console.error('Failed to connect wallet:', error);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        CONNECT WALLET
                      </button>
                      <button
                        onClick={() => setShowLoginPrompt(false)}
                        className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <GameBoard />
            </div>
            
            {/* Mobile Controls */}
            <div className="lg:hidden mt-3 bg-gray-800/50 p-3 rounded-lg border border-cyan-400/20">
              <h3 className="text-center font-medium mb-2 text-cyan-400">CONTROLS</h3>
              <div className="grid grid-cols-3 gap-1 max-w-[180px] mx-auto">
                <div></div>
                <button 
                  className="bg-cyan-900/50 hover:bg-cyan-800/70 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-colors"
                  onClick={() => {}}
                >
                  ↑
                </button>
                <div></div>
                <button 
                  className="bg-cyan-900/50 hover:bg-cyan-800/70 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-colors"
                  onClick={() => {}}
                >
                  ←
                </button>
                <button 
                  className="bg-cyan-900/50 hover:bg-cyan-800/70 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-colors"
                  onClick={() => {}}
                >
                  ↓
                </button>
                <button 
                  className="bg-cyan-900/50 hover:bg-cyan-800/70 p-3 rounded-lg text-cyan-300 font-bold text-lg border border-cyan-400/30 transition-colors"
                  onClick={() => {}}
                >
                  →
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Achievements & How to Play */}
          <div className="lg:col-span-2 flex flex-col gap-3 h-full">
            <div className="flex-1 overflow-y-auto">
              <Achievements />
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg border border-cyan-400/20">
              <h3 className="font-bold text-cyan-400 text-sm md:text-base mb-2">HOW TO PLAY</h3>
              <ul className="space-y-1 text-xs md:text-sm text-gray-300">
                <li>• Use arrow keys to move</li>
                <li>• Eat the food to grow</li>
                <li>• Avoid hitting walls or yourself</li>
                <li>• Pause: P</li>
                <li>• Restart: R</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-xs text-gray-500 mt-2">
        <p>Snake Game &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// Main game component
const SnakeGame: React.FC = () => {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
};

export default SnakeGame;