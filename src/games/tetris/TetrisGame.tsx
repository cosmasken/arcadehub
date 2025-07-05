import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useGame, GameProvider } from './context';
import Board from './components/Board';
import ProgressBar from '../../components/ProgressBar';
import { toast } from '../../hooks/use-toast';
import GameMenu from './components/GameMenu';
import HelpSidebar from './components/HelpSidebar';
import SplashScreen from './components/SplashScreen';
import HoldPiece from './components/HoldPiece';
import NextPieces from './components/NextPieces';
import BackButton from './components/BackButton';
import { Link } from 'react-router-dom';
import {ChevronLeft} from 'lucide-react';
import useWalletStore from '../../stores/useWalletStore';
import { getActiveTournamentIdByName } from '../../lib/tournamentUtils';
import { joinTournamentAA, submitScoreAA } from '../../lib/aaUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { GameState } from './types';
import { useNavigate } from 'react-router-dom';
import { TouchControls } from './components/TouchControls';
import { useMediaQuery } from 'react-responsive';
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
  const { state, dispatch, saveGame } = useGame();
  const { aaSigner } = useWalletStore();
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const hasJoinedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  // Memoized tournament fetching function to prevent unnecessary re-renders
  const fetchTournamentId = useCallback(async () => {
    try {
      const id = await getActiveTournamentIdByName('Tetris');
      if (id) {
        setTournamentId(id);
      } else {
        toast({ variant: 'destructive', title: 'Tournament Not Found', description: 'Tetris tournament not found or is not active.' });
      }
    } catch (error) {
      console.error('Error fetching Tetris tournament ID:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Tournament Error', 
        description: 'Could not fetch tournament details. Please try again later.'
      });
    }
  }, []);

  // Fetch tournament ID on component mount
  useEffect(() => {
    fetchTournamentId();
  }, [fetchTournamentId]);

  // Memoized tournament joining function
  const joinTournament = useCallback(async () => {
    if (!aaSigner || tournamentId === null || hasJoinedRef.current) return;
    
    try {
      hasJoinedRef.current = true;
      await joinTournamentAA(aaSigner, tournamentId, { gasMultiplier: 1.5 });
      toast({ 
        title: 'Tournament Joined', 
        description: 'You have successfully joined the Tetris tournament!'
      });
    } catch (error) {
      console.error('Error joining tournament:', error);
      // Reset the flag so user can try again
      hasJoinedRef.current = false;
      toast({ 
        variant: 'destructive', 
        title: 'Tournament Error', 
        description: 'Failed to join the tournament. Please try again.'
      });
    }
  }, [aaSigner, tournamentId]);

  // Join tournament once signer and tournamentId are ready
  useEffect(() => {
    joinTournament();
  }, [joinTournament]);
  const prevScore = useRef(0);
  // Toast when score increases significantly
  useEffect(() => {
    if (state.stats.score - prevScore.current >= 500) {
      toast({ title: 'Great job!', description: `Score: ${state.stats.score}` });
      prevScore.current = state.stats.score;
    }
  }, [state.stats.score]);
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

  // Memoized score submission function
  const submitScore = useCallback(async () => {
    if (!aaSigner || !state.gameOver || tournamentId === null || hasSubmittedRef.current) return;
    
    try {
      hasSubmittedRef.current = true;
      await submitScoreAA(
        aaSigner,
        tournamentId,
        state.stats.score,
        { gasMultiplier: 1.5 }
      );
      toast({ 
        title: 'Score Submitted', 
        description: `Your score of ${state.stats.score.toLocaleString()} has been submitted to the tournament!`
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      // Reset the flag so user can try again
      hasSubmittedRef.current = false;
      toast({ 
        variant: 'destructive', 
        title: 'Score Submission Error', 
        description: 'Failed to submit your score. Please try again.'
      });
    }
  }, [aaSigner, state.gameOver, state.stats.score, tournamentId]);

  // Submit score when game over
  useEffect(() => {
    submitScore();
  }, [submitScore]);

  // Determine game status based on state
  const getGameStatus = useCallback((): 'start' | 'playing' | 'paused' | 'gameOver' => {
    if (state.gameOver) return 'gameOver';
    if (state.isPaused) return 'paused';
    return state.isStarted ? 'playing' : 'start';
  }, [state.gameOver, state.isPaused, state.isStarted]);

  // Handle keyboard input based on current controls using a more efficient approach
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const gameStatus = getGameStatus();
    if (gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) {
      return;
    }

    const currentControls = effectiveControls();
    
    // Handle both key and code for better compatibility
    const key = e.key || e.code;
    const code = e.code;
    
    // Define action mappings for better maintainability and performance
    // Use proper action types from GameAction union type
    const actionMap: Record<string, { type: 'MOVE_LEFT' | 'MOVE_RIGHT' | 'ROTATE' | 'SOFT_DROP' | 'HARD_DROP' | 'HOLD' | 'PAUSE' | 'RESET'; condition?: () => boolean }> = {
      [currentControls.rotate]: { type: 'ROTATE' },
      [currentControls.moveLeft]: { type: 'MOVE_LEFT' },
      [currentControls.moveRight]: { type: 'MOVE_RIGHT' },
      [currentControls.softDrop]: { type: 'SOFT_DROP' },
      [currentControls.hardDrop]: { type: 'HARD_DROP' },
      'Space': { type: 'HARD_DROP' }, // Special case for space bar
      [currentControls.hold]: { type: 'HOLD' },
      [currentControls.pause]: { 
        type: 'PAUSE',
        condition: () => {
          const currentStatus = getGameStatus();
          if (currentStatus === 'playing') {
            return true;
          } else if (currentStatus === 'paused') {
            dispatch({ type: 'RESET' });
            return false;
          }
          return false;
        }
      },
      'KeyP': { 
        type: 'PAUSE',
        condition: () => key.toLowerCase() === 'p' && getGameStatus() === 'playing'
      }
    };
    
    // Check for matching key or code
    const action = actionMap[key] || actionMap[code];
    
    if (action) {
      e.preventDefault();
      
      // If there's a condition function, check it first
      if (action.condition === undefined || action.condition()) {
        dispatch({ type: action.type });
      }
    }
  }, [dispatch, effectiveControls, getGameStatus]);

  // Handle touch gestures for mobile controls
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  
  // Minimum distance for a swipe to be registered
  const minSwipeDistance = 50;
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    const firstTouch = e.touches[0];
    setTouchStart({
      x: firstTouch.clientX,
      y: firstTouch.clientY
    });
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    const firstTouch = e.touches[0];
    setTouchEnd({
      x: firstTouch.clientX,
      y: firstTouch.clientY
    });
  }, [touchStart]);
  
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const gameStatus = getGameStatus();
    if (gameStatus === GameStatus.PAUSED || gameStatus === GameStatus.GAME_OVER) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    const distX = touchEnd.x - touchStart.x;
    const distY = touchEnd.y - touchStart.y;
    const absDistX = Math.abs(distX);
    const absDistY = Math.abs(distY);
    
    // Detect swipe direction if it exceeds minimum distance
    if (Math.max(absDistX, absDistY) > minSwipeDistance) {
      // More horizontal than vertical swipe
      if (absDistX > absDistY) {
        if (distX > 0) {
          // Right swipe
          dispatch({ type: 'MOVE_RIGHT' });
        } else {
          // Left swipe
          dispatch({ type: 'MOVE_LEFT' });
        }
      } else {
        // More vertical than horizontal swipe
        if (distY > 0) {
          // Down swipe
          dispatch({ type: 'SOFT_DROP' });
        } else {
          // Up swipe - rotate
          dispatch({ type: 'ROTATE' });
        }
      }
    } else {
      // Short tap - rotate piece
      dispatch({ type: 'ROTATE' });
    }
    
    // Reset touch points
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, dispatch, getGameStatus]);
  
  // Double tap handler for hard drop
  const [lastTap, setLastTap] = useState<number>(0);
  const handleDoubleTap = useCallback((e: TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      dispatch({ type: 'HARD_DROP' });
      e.preventDefault(); // Prevent zoom
    }
    
    setLastTap(currentTime);
  }, [lastTap, dispatch]);
  
  // Set up keyboard and touch event listeners
  useEffect(() => {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Touch controls
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchstart', handleDoubleTap);
    
    return () => {
      // Cleanup keyboard controls
      window.removeEventListener('keydown', handleKeyDown);
      
      // Cleanup touch controls
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchstart', handleDoubleTap);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd, handleDoubleTap]);

  const [highScore, setHighScore] = useLocalStorage('tetris-highscore', 0);
  const { isConnected } = useWalletStore();
  
  // Detect if device is mobile for showing touch controls
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showTouchControls, setShowTouchControls] = useState(false);
  
  // Only show touch controls on mobile devices and when the game is actually playing
  useEffect(() => {
    setShowTouchControls(isMobile && state.isStarted && !state.isPaused && !state.gameOver);
  }, [isMobile, state.isStarted, state.isPaused, state.gameOver]);

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
               <div className="flex justify-center min-h-[80px]">
                  <HoldPiece />
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
                <div className="w-full flex items-center justify-center" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
                  {/* Progress bar top */}
            <div className="w-full px-4 mb-2">
              <ProgressBar
                current={state.stats.linesCleared % 10}
                total={10}
                label={`Level ${state.stats.level} Progress`}
              />
            </div>
            <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                    <Board />
                  </div>
                </div>
                {currentStatus !== 'playing' && (
                  <GameMenu
  onStart={() => {
    if (currentStatus === GameStatus.START) {
      dispatch({ type: 'START' });
    } else {
      // Reset and start a new game
      dispatch({ type: 'RESET' });
      dispatch({ type: 'START' });
    }
    // Always hide the menu when starting a new game
    dispatch({ type: 'PAUSE', isPaused: false });
  }}
  onResume={() => dispatch({ type: 'PAUSE', isPaused: false })}
  onRestart={() => {
    // Reset game state completely
    dispatch({ type: 'RESET' });
    
    // Reset tournament participation flags
    hasJoinedRef.current = false;
    hasSubmittedRef.current = false;
    
    // Reset score tracking for toast notifications
    prevScore.current = 0;
    
    // Force a re-render by using a timeout
    // This ensures the game state is fully reset before starting a new game
    setTimeout(() => {
      // Start the game and ensure it's not paused
      dispatch({ type: 'START' });
      dispatch({ type: 'PAUSE', isPaused: false });
    }, 150);
  }}
  onQuit={() => navigate('/')}
  onSave={async () => {
    await saveGame('user-placeholder-address');
    toast({ title: 'Game Saved', description: 'Your Tetris progress has been saved.' });
  }}
/>
                )}
              </div>
            </div>

            {/* Right Sidebar - Desktop */}
            <div className="hidden lg:flex flex-col w-56 xl:w-64 bg-gray-900/80 border-l border-gray-800 p-4 space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <ChevronLeft className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Back to Home</span>
              </Link>
                
                <div className="space-y-4">
                  <NextPieces />
                </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Stats</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Score', value: state.stats.score.toLocaleString() },
                    { label: 'Level', value: state.stats.level }
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
          </div>

          {/* Help Sidebar */}
          <HelpSidebar
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            controls={controls}
          />
          
          {/* Touch Controls for Mobile */}
          <TouchControls 
            dispatch={dispatch} 
            visible={showTouchControls} 
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
