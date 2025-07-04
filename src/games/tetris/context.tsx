import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, GameAction, GameContextType, Position } from './types';
import { COLS, ROWS, SHAPES, COLORS, POINTS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';
import { gameReducer } from './gameReducer';

// Helper functions
const createBoard = (): number[][] => {
  const board: number[][] = [];
  for (let i = 0; i < ROWS; i++) {
    board.push(Array(COLS).fill(0));
  }
  return board;
};

const getRandomPiece = (): number =>
  Math.floor(Math.random() * (SHAPES.length - 1)) + 1;

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

// Helper function to check if a move is valid
const isValidMove = (board: number[][], shape: number[][], position: Position): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // Skip empty cells in the shape
      if (shape[y][x] === 0) continue;

      // Calculate board position
      const boardX = position.x + x;
      const boardY = position.y + y;

      // Check boundaries
      if (boardX < 0 || boardX >= COLS) return false;  // Left/Right walls
      if (boardY >= ROWS) return false;                 // Bottom

      // Check for collisions with existing pieces (only if within board bounds)
      if (boardY >= 0 && board[boardY][boardX] !== 0) {
        return false;
      }
    }
  }
  return true;
};

// Helper functions
const rotateMatrix = (matrix: number[][]): number[][] => {
  if (!matrix.length) return matrix;

  // Make the matrix square if it's not
  const N = Math.max(matrix.length, Math.max(...matrix.map(row => row.length)));
  const paddedMatrix = matrix.map(row => [...row, ...Array(N - row.length).fill(0)]);
  while (paddedMatrix.length < N) {
    paddedMatrix.push(Array(N).fill(0));
  }

  // Create result matrix
  const result = Array(N).fill(0).map(() => Array(N).fill(0));

  // Do the rotation (90 degrees clockwise)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      result[x][N - 1 - y] = paddedMatrix[y][x] || 0;
    }
  }

  // Trim empty rows and columns
  // Trim empty rows from top and bottom
  const trimmed = result.filter(row => row.some(cell => cell !== 0));

  // Trim empty columns from left and right
  const cols = trimmed[0]?.length || 0;
  let startCol = 0;
  let endCol = cols - 1;

  for (let x = 0; x < cols; x++) {
    if (trimmed.some(row => row[x] !== 0)) {
      startCol = x;
      break;
    }
  }

  for (let x = cols - 1; x >= 0; x--) {
    if (trimmed.some(row => row[x] !== 0)) {
      endCol = x;
      break;
    }
  }

  return trimmed.map(row => row.slice(startCol, endCol + 1));
};

const rotatePiece = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const rotated = rotateMatrix(state.currentPiece.shape);

  // Check if rotation is valid in current position
  if (isValidMove(state.board, rotated, state.currentPiece.position)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        shape: rotated,
      },
    };
  }

  // Try wall kicks with more positions
  const kicks = [
    { x: -1, y: 0 },  // try left
    { x: 1, y: 0 },   // try right
    { x: 0, y: -1 },  // try up
    { x: -2, y: 0 },  // try two left
    { x: 2, y: 0 },   // try two right
    { x: 0, y: -2 },  // try two up
    { x: -1, y: -1 }, // try left and up
    { x: 1, y: -1 },  // try right and up
  ];

  // Try each wall kick position
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

  // Game loop
  useEffect(() => {
    if (!state.isStarted || state.gameOver) return;

    const tick = () => {
      dispatch({ type: 'TICK' });
    };

    const speed = Math.max(100, 1000 - (state.stats.level * 50));
    const gameLoop = setInterval(tick, speed);
    return () => clearInterval(gameLoop);
  }, [state.isStarted, state.gameOver, state.stats.level]);

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
