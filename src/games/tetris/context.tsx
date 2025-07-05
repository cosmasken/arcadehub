import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, GameAction, GameContextType, Position } from './types';
import { COLS, ROWS, SHAPES, COLORS, POINTS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';
import { gameReducer } from './gameReducer';

// Import helper functions from utils
import { createBoard, getRandomPiece, isValidMove, rotateMatrix, getSRSKicks, PIECE_TYPE_MAP, SRS_KICKS, SRS_I_KICKS } from './utils';

const createDefaultState = (): GameState => ({
  board: createBoard(),
  currentPiece: null,
  nextPieces: Array(3).fill(0).map(getRandomPiece),
  holdPiece: null,
  canHold: true,
  gameOver: false,
  isPaused: false,
  isStarted: false,
  stats: {
    score: 0,
    level: 1,
    linesCleared: 0,
    tetrisCount: 0,
    totalPieces: 0,
    startTime: 0,
    gameTime: 0,
    lastLevelUp: 0,
    highScore: 0,
    achievements: [],
    inventory: {},
    coins: 0,
  },
  settings: {
    ghostPiece: false,
    holdPiece: true,
    nextPiecesCount: 3,
    theme: 'classic',
    soundEnabled: true,
    musicEnabled: true,
    controls: {
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      rotate: 'ArrowUp',
      softDrop: 'ArrowDown',
      hardDrop: ' ',
      hold: 'c',
      pause: 'p',
    },
  },
});

const getInitialState = (): GameState => {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  const savedState = localStorage.getItem('tetris-state');
  if (!savedState) return createDefaultState();

  try {
    const parsed = JSON.parse(savedState);
    // Validate saved state
    if (parsed.stats && parsed.settings) {
      return {
        ...createDefaultState(),
        ...parsed,
        board: createBoard(),
        currentPiece: null,
        gameOver: false,
        isPaused: false,
        isStarted: false,
      };
    }
  } catch (e) {
    console.error('Failed to parse saved game state', e);
  }

  return createDefaultState();
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial state
const initialState = getInitialState();

// isValidMove is now imported from utils.ts

// All helper functions now imported from utils.ts

const rotatePiece = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  // Use proper typing for currentPiece properties
  const { shape } = state.currentPiece;
  // Convert piece type number to string representation for getSRSKicks
  const pieceType = state.currentPiece.type;
  const type = PIECE_TYPE_MAP[pieceType] || '';
  const rotation = state.currentPiece.rotation || 0;
  // Next rotation state (0-3)
  const nextRotation = ((rotation ?? 0) + 1) % 4;

  // Rotate shape
  const rotated = rotateMatrix(shape);

  // Get SRS kicks for this piece and rotation
  const kicks = getSRSKicks(type, rotation, nextRotation);

  // Try each kick
  for (const kick of kicks) {
    const newPosition = {
      x: state.currentPiece.position.x + kick.x,
      y: state.currentPiece.position.y + kick.y,
    };
    if (isValidMove(state.board, rotated, newPosition)) {
      return {
        ...state,
        currentPiece: {
          ...state.currentPiece,
          shape: rotated,
          position: newPosition,
          rotation: nextRotation,
        },
      };
    }
  }
  // If no valid rotation found, keep the original position
  return state;
};

// Context provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- Save/Load Game Feature ---
  // Stub: Replace with real on-chain logic
  const checkOnChainSave = async (userAddress: string): Promise<boolean> => {
    // TODO: Query blockchain for existing save for userAddress
    // Return true if found, false otherwise
    return false;
  };

  const saveGame = useCallback(async (userAddress: string) => {
    if (typeof window === 'undefined') return;
    const stateToSave = stateRef.current;
    // TODO: Save to chain if needed
    localStorage.setItem('tetris-state', JSON.stringify(stateToSave));
  }, []);

  const loadGame = useCallback(async (userAddress: string) => {
    if (typeof window === 'undefined') return;
    const onChainExists = await checkOnChainSave(userAddress);
    let loadedState = null;
    if (onChainExists) {
      // TODO: Load from chain
      // For now, fallback to local
    }
    const saved = localStorage.getItem('tetris-state');
    if (saved) {
      try {
        loadedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: loadedState });
      } catch (e) {
        console.error('Failed to load saved game state', e);
      }
    }
  }, [dispatch]);

  // (Removed autosave useEffect to rely on manual save)

  // Frame reference for animation frame ID
  const frameRef = useRef<number>();

  // Game loop using requestAnimationFrame for smoother performance
  useEffect(() => {
    if (!state.isStarted || state.gameOver || state.isPaused) return;
    
    let lastTime = 0;
    let accumulator = 0;
    
    // Calculate speed based on level (in milliseconds)
    const speed = Math.max(100, 1000 - (state.stats.level * 50));
    
    const gameLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      // Accumulate time until we reach the speed threshold
      accumulator += deltaTime;
      
      // Only dispatch TICK when enough time has passed
      if (accumulator >= speed) {
        dispatch({ type: 'TICK' });
        accumulator = 0; // Reset accumulator
      }
      
      // Continue the loop
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    frameRef.current = requestAnimationFrame(gameLoop);
    
    // Cleanup function
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state.isStarted, state.gameOver, state.isPaused, state.stats.level, dispatch]);

  // Check for achievements
  useEffect(() => {
    if (!state.isStarted || state.gameOver) return;

    const checkAchievements = () => {
      const newAchievements = ACHIEVEMENTS.filter(
        a =>
          !state.stats.achievements.includes(a.id) &&
          a.condition(state.stats)
      );

      if (newAchievements.length > 0) {
        const newAchievementIds = newAchievements.map(a => a.id);
        const totalReward = newAchievements.reduce((sum, a) => sum + a.reward, 0);

        // Show achievement notification
        newAchievements.forEach(achievement => {
          console.log(`Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
          // You can trigger a toast notification here
        });

        // Update state with new achievements and coins
        dispatch({
          type: 'BUY_ITEM',
          itemId: '', // This won't match any item, just a way to update state
        });
      }
    };

    checkAchievements();
  }, [state.stats.linesCleared, state.stats.score, state.stats.level, state.isStarted, state.gameOver, state.stats.achievements, state.stats, dispatch]);

  const buyItem = useCallback((itemId: string) => {
    dispatch({ type: 'BUY_ITEM', itemId });
  }, [dispatch]);

  const claimAchievement = useCallback((achievementId: string) => {
    // This would be called when a user clicks to claim an achievement
    // For now, we're auto-claiming achievements in the effect above
  }, []);



  // Expose the context value
  // Expose the context value (with async save/load)
  const contextValue: GameContextType = {
    state,
    dispatch,
    buyItem,
    claimAchievement,
    saveGame, // async (userAddress: string) => Promise<void>
    loadGame, // async (userAddress: string) => Promise<void>
    isValidMove,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
