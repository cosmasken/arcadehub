import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { COLS, ROWS, SHAPES, COLORS, POINTS, LEVELS, SHOP_ITEMS, ACHIEVEMENTS } from './constants';
import { GameState, GameAction, GameContextType, GameStats, GameSettings, Position } from './types';

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

const getInitialState = (): GameState => {
  const savedState = localStorage.getItem('tetris-save');
  
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      // Validate saved state
      if (parsed.stats && parsed.settings) {
        return {
          ...parsed,
          board: createBoard(),
          currentPiece: null,
          nextPieces: Array(3).fill(0).map(getRandomPiece),
          holdPiece: null,
          canHold: true,
          gameOver: false,
          isPaused: false,
          isStarted: false,
        };
      }
    } catch (e) {
      console.error('Failed to parse saved game state', e);
    }
  }

  // Default initial state
  return {
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
      highScore: parseInt(localStorage.getItem('tetris-highscore') || '0', 10),
      achievements: [],
      inventory: {},
      coins: 0,
    },
    settings: {
      ghostPiece: false,
      holdPiece: false,
      nextPiecesCount: 1,
      theme: 'default',
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
  };
};

// Game context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_LEFT':
      return !state.isPaused && !state.gameOver ? movePiece(state, -1, 0) : state;
    case 'MOVE_RIGHT':
      return !state.isPaused && !state.gameOver ? movePiece(state, 1, 0) : state;
    case 'ROTATE':
      return !state.isPaused && !state.gameOver ? rotatePiece(state) : state;
    case 'SOFT_DROP':
      return !state.isPaused && !state.gameOver ? movePiece(state, 0, 1) : state;
    case 'HARD_DROP':
      return !state.isPaused && !state.gameOver ? hardDrop(state) : state;
    case 'HOLD':
      return !state.isPaused && !state.gameOver ? holdPiece(state) : state;
    case 'PAUSE':
      return {
        ...state,
        isPaused: action.isPaused !== undefined ? action.isPaused : !state.isPaused,
      };
    case 'RESET':
    case 'RESET_GAME':
      return getInitialState();
    case 'START':
    case 'START_GAME':
      return { ...state, isStarted: true, isPaused: false, gameOver: false };
    case 'TICK':
      return !state.isPaused && !state.gameOver ? gameTick(state) : state;
    case 'BUY_ITEM':
      return buyItem(state, action.itemId);
    case 'GAME_OVER':
      return { ...state, gameOver: true, isPaused: true };
    case 'ADD_SCORE':
      return {
        ...state,
        stats: {
          ...state.stats,
          score: state.stats.score + action.points,
        },
      };
    case 'ADD_LINES': {
      const newLines = state.stats.linesCleared + action.lines;
      const newLevel = Math.min(
        Math.floor(newLines / 10) + 1,
        LEVELS.length
      );
      
      return {
        ...state,
        stats: {
          ...state.stats,
          linesCleared: newLines,
          level: newLevel,
        },
      };
    }
    default:
      return state;
  }
};

// Helper functions for the reducer
const movePiece = (state: GameState, dx: number, dy: number): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const newPosition = {
    x: state.currentPiece.position.x + dx,
    y: state.currentPiece.position.y + dy,
  };

  if (isValidMove(state.board, state.currentPiece.shape, newPosition)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }

  // If we can't move down, lock the piece
  if (dy > 0) {
    return lockPiece(state);
  }

  return state;
};

const rotatePiece = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const rotated = rotateMatrix(state.currentPiece.shape);
  
  // Check if rotation is valid
  if (isValidMove(state.board, rotated, state.currentPiece.position)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        shape: rotated,
      },
    };
  }

  // Try wall kicks
  const kicks = [-1, 1, -2, 2];
  for (const kick of kicks) {
    const newPosition = {
      ...state.currentPiece.position,
      x: state.currentPiece.position.x + kick,
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

  return state;
};

const hardDrop = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  let newY = state.currentPiece.position.y;
  while (isValidMove(state.board, state.currentPiece.shape, {
    ...state.currentPiece.position,
    y: newY + 1,
  })) {
    newY++;
  }

  // Add points for hard drop
  const linesDropped = newY - state.currentPiece.position.y;
  const pointsToAdd = linesDropped * POINTS.HARD_DROP;

  const newState = {
    ...state,
    currentPiece: {
      ...state.currentPiece,
      position: {
        ...state.currentPiece.position,
        y: newY,
      },
    },
    stats: {
      ...state.stats,
      score: state.stats.score + pointsToAdd,
    },
  };

  // Lock the piece after hard drop
  return lockPiece(newState);
};

const holdPiece = (state: GameState): GameState => {
  if (!state.currentPiece || !state.settings.holdPiece || !state.canHold) return state;

  const newHoldPiece = state.currentPiece.type;
  const nextPieces = [...state.nextPieces];
  const nextPiece = nextPieces.shift() || getRandomPiece();
  nextPieces.push(getRandomPiece());

  return {
    ...state,
    currentPiece: state.holdPiece ? {
      type: state.holdPiece,
      shape: SHAPES[state.holdPiece],
      position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    } : {
      type: nextPiece,
      shape: SHAPES[nextPiece],
      position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    },
    holdPiece: newHoldPiece,
    nextPieces,
    canHold: false,
  };
};

const gameTick = (state: GameState): GameState => {
  if (state.gameOver || state.isPaused) return state;

  // If no current piece, create a new one
  if (!state.currentPiece) {
    return spawnNewPiece(state);
  }

  // Move piece down
  return movePiece(state, 0, 1);
};

const buyItem = (state: GameState, itemId: string): GameState => {
  const item = SHOP_ITEMS.find(item => item.id === itemId);
  if (!item || state.stats.coins < item.price) return state;

  // Apply item effect
  const newSettings = { ...state.settings };
  if (item.type === 'upgrade' && item.effect) {
    Object.entries(item.effect).forEach(([key, value]) => {
      // @ts-expect-error - TypeScript doesn't understand our action type narrowing
      newSettings[key as keyof typeof newSettings] = value;
    });
  }

  // Update inventory
  const newInventory = { ...state.stats.inventory };
  newInventory[itemId] = (newInventory[itemId] || 0) + 1;

  return {
    ...state,
    settings: newSettings,
    stats: {
      ...state.stats,
      coins: state.stats.coins - item.price,
      inventory: newInventory,
    },
  };
};

// Helper functions
const isValidMove = (board: number[][], shape: number[][], position: Position): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 0) continue;

      const newX = position.x + x;
      const newY = position.y + y;

      if (
        newX < 0 ||
        newX >= COLS ||
        newY >= ROWS ||
        (newY >= 0 && board[newY][newX] !== 0)
      ) {
        return false;
      }
    }
  }
  return true;
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const result = Array(N).fill(0).map(() => Array(N).fill(0));
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      result[x][N - 1 - y] = matrix[y][x];
    }
  }
  
  return result;
};

const lockPiece = (state: GameState): GameState => {
  if (!state.currentPiece) return state;

  // Create a new board with the locked piece
  const newBoard = state.board.map(row => [...row]);
  const { shape, position, type } = state.currentPiece;
  const linesCleared = 0;

  // Lock the piece on the board
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 0) continue;
      
      const boardY = position.y + y;
      const boardX = position.x + x;
      
      if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
        newBoard[boardY][boardX] = type;
      }
    }
  }


  // Check for completed lines
  const completedLines: number[] = [];
  for (let y = ROWS - 1; y >= 0; y--) {
    if (newBoard[y].every(cell => cell !== 0)) {
      completedLines.push(y);
    }
  }

  // Remove completed lines and add new empty lines at the top
  completedLines.forEach(line => {
    newBoard.splice(line, 1);
    newBoard.unshift(Array(COLS).fill(0));
  });

  // Calculate score
  const linePoints = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
  const pointsToAdd = linePoints[completedLines.length] * (state.stats.level + 1);
  const isTetris = completedLines.length === 4;

  // Update stats
  const newStats: GameStats = {
    ...state.stats,
    score: state.stats.score + pointsToAdd,
    linesCleared: state.stats.linesCleared + completedLines.length,
    tetrisCount: isTetris ? state.stats.tetrisCount + 1 : state.stats.tetrisCount,
    totalPieces: state.stats.totalPieces + 1,
  };

  // Check for level up
  const currentLevel = state.stats.level;
  const newLevel = Math.min(
    LEVELS[LEVELS.length - 1].level,
    Math.floor(newStats.linesCleared / 10) + 1
  );

  if (newLevel > currentLevel) {
    newStats.level = newLevel;
    newStats.lastLevelUp = Date.now();
  }

  // Check for game over
  const isGameOver = newBoard[0].some(cell => cell !== 0);

  // Spawn new piece or end game
  if (isGameOver) {
    return {
      ...state,
      board: newBoard,
      gameOver: true,
      stats: {
        ...newStats,
        highScore: Math.max(newStats.highScore, newStats.score),
      },
    };
  }

  // Spawn new piece
  return spawnNewPiece({
    ...state,
    board: newBoard,
    stats: newStats,
    canHold: true,
  });
};

const spawnNewPiece = (state: GameState): GameState => {
  const nextPieces = [...state.nextPieces];
  const nextPiece = nextPieces.shift() || getRandomPiece();
  nextPieces.push(getRandomPiece());

  const newPiece = {
    type: nextPiece,
    shape: SHAPES[nextPiece],
    position: { x: Math.floor(COLS / 2) - 1, y: 0 },
  };

  // Check if the new piece can be placed
  if (!isValidMove(state.board, newPiece.shape, newPiece.position)) {
    return {
      ...state,
      gameOver: true,
      stats: {
        ...state.stats,
        highScore: Math.max(state.stats.highScore, state.stats.score),
      },
    };
  }

  return {
    ...state,
    currentPiece: newPiece,
    nextPieces,
  };
};

// Context provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState);

  // Auto-save when state changes
  const saveGame = useCallback(() => {
    if (state.isStarted && !state.gameOver) {
      localStorage.setItem('tetris-save', JSON.stringify({
        ...state,
        board: createBoard(), // Don't save the board
        currentPiece: null,
        gameOver: false,
        isPaused: false,
        isStarted: false,
      }));
      
      if (state.stats.score > state.stats.highScore) {
        localStorage.setItem('tetris-highscore', state.stats.score.toString());
      }
    }
  }, [state]);

  useEffect(() => {
    saveGame();
  }, [saveGame, state]); // Include state in dependency array to fix the warning

  // Check for achievements
  useEffect(() => {
    if (!state.isStarted || state.gameOver) return;

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

      // Update achievements and coins in localStorage
      const updatedStats = {
        ...state.stats,
        achievements: [...state.stats.achievements, ...newAchievementIds],
        coins: state.stats.coins + totalReward,
      };

      localStorage.setItem('tetris-save', JSON.stringify({
        ...state,
        stats: updatedStats,
        board: createBoard(),
        currentPiece: null,
        gameOver: false,
        isPaused: false,
        isStarted: false,
      }));
    }
  }, [state.stats.linesCleared, state.stats.score, state.stats.level]);

  const buyItem = useCallback((itemId: string) => {
    dispatch({ type: 'BUY_ITEM', itemId });
  }, []);

  const claimAchievement = useCallback((achievementId: string) => {
    // This would be called when a user clicks to claim an achievement
    // For now, we're auto-claiming achievements in the effect above
  }, []);

  const loadGame = useCallback(() => {
    // This would reload the game from localStorage
    // The initial state already handles loading from localStorage
    dispatch({ type: 'RESET' });
  }, []);

  // Expose the isValidMove function
  const contextValue: GameContextType = {
    state,
    dispatch,
    buyItem,
    claimAchievement,
    saveGame,
    loadGame,
    isValidMove: (board: number[][], shape: number[][], position: Position) => 
      isValidMove(board, shape, position),
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
