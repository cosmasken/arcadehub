import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameProvider, useGame } from './context';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import useWalletStore from '../../stores/useWalletStore';
import { GameBoard, StatsPanel, Shop, Achievements } from './components';
import Leaderboard from './components/Leaderboard';
import ProgressBar from '../../components/ProgressBar';
import { toast } from '../../hooks/use-toast';
import { LEVELS, ACHIEVEMENTS } from './constants';
import { getActiveTournamentIdByName } from '../../lib/tournamentUtils';
import { joinTournamentAA, submitScoreAA } from '../../lib/aaUtils';
import { useNavigate } from 'react-router-dom';

// Inner component to handle game UI
const GameUI: React.FC = () => {
  const { state, startGame, pauseGame, resetGame, changeDirection } = useGame();
  const [tournamentId, setTournamentId] = React.useState<number | null>(null);
  const prevAchievements = React.useRef<string[]>([]);
  // --- Local UI state for leaderboard modal ---
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const navigate = useNavigate();

  // Show toast on new achievement
  useEffect(() => {
    if (prevAchievements.current.length === 0) {
      prevAchievements.current = state.achievements;
      return;
    }
    const newAch = state.achievements.find((id) => !prevAchievements.current.includes(id));
    if (newAch) {
      const achObj = ACHIEVEMENTS.find((a) => a.id === newAch);
      toast({ title: 'Achievement Unlocked!', description: achObj?.name || newAch });
    }
    prevAchievements.current = state.achievements;
  }, [state.achievements]);
  const { isConnected, connect, aaSigner } = useWalletStore();

  // === Tournament integration ===
  const hasJoinedRef = React.useRef(false);
  const hasSubmittedRef = React.useRef(false);

  // Fetch tournament ID on component mount
  useEffect(() => {
    getActiveTournamentIdByName('Snake')
      .then(id => {
        if (id) {
          setTournamentId(id);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Snake tournament not found or is not active.' });
        }
      })
      .catch(error => {
        console.error('Error fetching Snake tournament ID:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tournament details.' });
      });
  }, []);

  // Auto-join tournament once signer and tournamentId are ready
  useEffect(() => {
    if (!aaSigner || tournamentId === null || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    joinTournamentAA(aaSigner, tournamentId, { gasMultiplier: 1.5 }).catch(() => {
      /* ignore duplicate join errors */
    });
  }, [aaSigner, tournamentId]);

  // Submit score on game over
  useEffect(() => {
    if (!aaSigner || !state.gameOver || tournamentId === null || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    submitScoreAA(
      aaSigner,
      tournamentId,
      state.score,
      { gasMultiplier: 1.5 }
    ).catch(console.error);
  }, [aaSigner, state.gameOver, state.score, tournamentId]);
  const {
    state: gameState,
    dispatch,
    openShop,
    closeShop,
    openSettings,
    closeSettings,
    openAchievements,
    closeAchievements,
    showLogin,
    hideLogin,
    updateSettings,
    playSound,
  } = useGameState();

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
    // Mark as initialized through dispatch
    dispatch({ type: 'SET_INITIALIZED', payload: true });
  }, [resetGame, dispatch]);

  // Handle game start with auth check
  const handleStartGame = React.useCallback(async () => {
    if (!isConnected) {
      showLogin();
      return;
    }
    startGame();
  }, [isConnected, startGame, showLogin]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!gameState.ui.isInitialized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.ui.shopOpen || gameState.ui.settingsOpen) return; // Block input if modal is open

      // Check for movement keys (Arrow keys or WASD)
      const isMovementKey = gameState.settings.useWASD
        ? ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)
        : ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code);

      if (isMovementKey && state.isStarted && !state.gameOver) {
        e.preventDefault();
        return; // Let the game handle movement
      }

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

      // Open shop with S key
      if (e.code === 'KeyS' && !state.isStarted) {
        e.preventDefault();
        openShop();
        playSound('click');
      }

      // Open achievements with A key
      if (e.code === 'KeyA' && !state.isStarted) {
        e.preventDefault();
        openAchievements();
        playSound('click');
      }

      // Open settings with Escape key
      if (e.code === 'Escape') {
        e.preventDefault();
        openSettings();
        playSound('click');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isStarted, state.gameOver, startGame, pauseGame, resetGame, handleStartGame, gameState.ui.isInitialized, gameState.ui.shopOpen, gameState.ui.settingsOpen, gameState.settings.useWASD, openShop, openSettings, openAchievements, playSound]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Progress Indicator */}
      <div className="max-w-md mx-auto pt-4 px-4">
        <ProgressBar
          current={state.foodEaten}
          total={LEVELS[state.level - 1].linesNeeded}
          label={`Level ${state.level} Progress`}
        />
      </div>
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
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-3 h-full min-w-[200px] max-w-[300px]">
            <StatsPanel />
            <div className="bg-gray-800/50 p-3 rounded-lg border border-cyan-400/20">
              <h3 className="font-bold text-cyan-400 text-sm mb-2">QUICK ACTIONS</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { openShop(); playSound('click'); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  🛒 SHOP
                </button>
                <button
                  onClick={() => { openAchievements(); playSound('click'); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  🏆 ACHIEVEMENTS
                </button>
                <button
                  onClick={() => { openSettings(); playSound('click'); }}
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  ⚙️ SETTINGS
                </button>
              </div>
            </div>
          </div>

          {/* Main Game Area - Let GameBoard handle all menu states */}
          <div className="lg:col-span-6 xl:col-span-8 h-full">
            <div 
              className="bg-black/30 rounded-lg shadow-lg overflow-hidden h-full flex items-center justify-center border border-cyan-400/20"
              style={{ filter: gameState.ui.shopOpen || gameState.ui.settingsOpen ? 'blur(2px)' : 'none' }}
            >
              {!gameState.ui.isInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                  <div className="animate-pulse text-cyan-400">Loading...</div>
                </div>
              )}
              {gameState.ui.showLoginPrompt && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 transition-all duration-300">
                  <div className="bg-gray-900/90 p-8 rounded-lg border border-cyan-400/30 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 animate-in">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">SIGN IN REQUIRED</h3>
                    <p className="text-gray-300 mb-6">Please connect your wallet to start playing and earn rewards!</p>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={async () => {
                          try {
                            playSound('click');
                            await connect();
                            hideLogin();
                            startGame();
                          } catch (error) {
                            console.error('Failed to connect wallet:', error);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                      >
                        CONNECT WALLET
                      </button>
                      <button
                        onClick={() => { hideLogin(); playSound('click'); }}
                        className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-all duration-200"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <GameBoard />
            </div>
          </div>

          {/* Right Sidebar How to Play */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-3 h-full min-w-[200px] max-w-[300px]">

            <div className="bg-gray-800/50 p-3 rounded-lg border border-cyan-400/20">
              <h3 className="font-bold text-cyan-400 text-sm md:text-base mb-2">HOW TO PLAY</h3>
              <ul className="space-y-1 text-xs md:text-sm text-gray-300">
                <li>• Use {gameState.settings.useWASD ? 'WASD' : 'arrow keys'} to move</li>
                <li>• Eat the food to grow</li>
                <li>• Avoid hitting walls or yourself</li>
                <li>• Pause: P</li>
                <li>• Restart: R</li>
                <li>• Shop: S</li>
                <li>• Achievements: A</li>
                <li>• Settings: Esc</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shop Modal */}
        {gameState.ui.shopOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-gray-900/95 rounded-lg border border-cyan-400/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100 animate-in">
              <Shop
                shopOpen={gameState.ui.shopOpen}
                setShopOpen={closeShop}
                onOpen={() => { openShop(); if (state.isStarted) pauseGame(); }}
                onClose={() => { closeShop(); playSound('click'); }}
                onBuy={() => playSound('buy')}
              />
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {gameState.ui.achievementsOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-gray-900/95 rounded-lg border border-cyan-400/30 max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 animate-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">🏆 ACHIEVEMENTS</h2>
                <button
                  onClick={() => { closeAchievements(); playSound('click'); }}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                <Achievements />
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {gameState.ui.settingsOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-gray-900/95 rounded-lg border border-cyan-400/30 max-w-md w-full mx-4 p-6 transform transition-all duration-300 scale-100 animate-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400">SETTINGS</h2>
                <button
                  onClick={() => { closeSettings(); playSound('click'); }}
                  className="text-gray-400 hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Control Scheme:</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { updateSettings({ useWASD: false }); playSound('click'); }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${!gameState.settings.useWASD
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Arrow Keys
                    </button>
                    <button
                      onClick={() => { updateSettings({ useWASD: true }); playSound('click'); }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${gameState.settings.useWASD
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      WASD
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Sound Effects:</label>
                  <button
                    onClick={() => { updateSettings({ soundEnabled: !gameState.settings.soundEnabled }); playSound('click'); }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${gameState.settings.soundEnabled
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {gameState.settings.soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-cyan-400 font-medium mb-2">Keyboard Shortcuts:</h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>• Space/Enter: Start Game</div>
                    <div>• P: Pause/Resume</div>
                    <div>• R: Restart</div>
                    <div>• S: Open Shop</div>
                    <div>• A: Open Achievements</div>
                    <div>• Esc: Settings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
    <GameStateProvider>
      <GameProvider>
        <GameUI />
      </GameProvider>
    </GameStateProvider>
  );
};

export default SnakeGame;