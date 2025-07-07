import { GameState, GameAction } from './types';
import { COLS, ROWS, SHAPES, POINTS, LEVELS, SHOP_ITEMS } from './constants';
import { 
  attemptRotation, 
  isValidPosition, 
  getShapeForRotation, 
  getSpawnPosition 
} from './utils/rotationUtils';

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
  nextPieces: Array(3).fill(0).map(() => getRandomPiece()),
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
      hardDrop: 'Space',
      hold: 'KeyC',
      pause: 'KeyP',
    },
  },
});

const spawnNewPiece = (state: GameState): GameState => {
  const pieceType = state.nextPieces[0];
  const spawnPos = getSpawnPosition(pieceType);
  const shape = getShapeForRotation(pieceType, 0);
  
  const newPiece = {
    type: pieceType,
    shape,
    position: spawnPos,
    rotation: 0
  };
  
  const nextPieces = [...state.nextPieces.slice(1), getRandomPiece()];
  
  // Check if the new piece can be placed
  if (!isValidPosition(state.board, newPiece.shape, newPiece.position)) {
    return { ...state, gameOver: true };
  }
  
  return {
    ...state,
    currentPiece: newPiece,
    nextPieces,
    stats: {
      ...state.stats,
      totalPieces: state.stats.totalPieces + 1
    }
  };
};

const lockPiece = (state: GameState): GameState => {
  if (!state.currentPiece) return state;
  
  // Create a new board with the locked piece
  const newBoard = state.board.map(row => [...row]);
  const { shape, position, type } = state.currentPiece;
  
  // Add piece to the board
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardY = position.y + y;
        const boardX = position.x + x;
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          newBoard[boardY][boardX] = type;
        }
      }
    }
  }
  
  // Check for completed lines
  let linesCleared = 0;
  let tetrisCount = state.stats.tetrisCount;
  
  for (let y = ROWS - 1; y >= 0; y--) {
    if (newBoard[y].every(cell => cell !== 0)) {
      // Remove the line and add a new empty one at the top
      newBoard.splice(y, 1);
      newBoard.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // Check the same row again since we moved everything down
    }
  }
  
  // Count Tetris (4 lines cleared at once)
  if (linesCleared === 4) {
    tetrisCount++;
  }
  
  // Calculate score with level multiplier
  const linePoints = [0, 100, 300, 500, 800]; // Points for 0-4 lines
  const basePoints = linePoints[Math.min(linesCleared, linePoints.length - 1)];
  const levelMultiplier = state.stats.level;
  const score = state.stats.score + (basePoints * levelMultiplier);
  
  // Calculate level progression
  const newTotalLines = state.stats.linesCleared + linesCleared;
  const level = Math.min(
    Math.floor(newTotalLines / 10) + 1,
    LEVELS.length
  );
  
  return {
    ...state,
    board: newBoard,
    currentPiece: null,
    canHold: true,
    stats: {
      ...state.stats,
      score,
      level,
      linesCleared: newTotalLines,
      tetrisCount,
      highScore: Math.max(score, state.stats.highScore),
    },
  };
};

const movePiece = (state: GameState, dx: number, dy: number): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;
  
  const newPosition = {
    x: state.currentPiece.position.x + dx,
    y: state.currentPiece.position.y + dy,
  };

  // If moving down and can't move, lock the piece
  if (dy > 0 && !isValidPosition(state.board, state.currentPiece.shape, newPosition)) {
    return lockPiece(state);
  }

  // If the move is valid, update position
  if (isValidPosition(state.board, state.currentPiece.shape, newPosition)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }
  
  return state;
};

const rotatePiece = (state: GameState, clockwise: boolean = true): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;

  const { type, position, rotation = 0 } = state.currentPiece;
  
  // Use the enhanced rotation system
  const rotationResult = attemptRotation(
    state.board,
    state.currentPiece.shape,
    position,
    type,
    rotation,
    clockwise
  );
  
  if (rotationResult.success) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        shape: rotationResult.newShape,
        position: rotationResult.newPosition,
        rotation: rotationResult.newRotation
      }
    };
  }
  
  return state; // No valid rotation found
};

const hardDrop = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;
  
  let newY = state.currentPiece.position.y;
  let dropDistance = 0;
  
  // Find the lowest valid position
  while (isValidPosition(state.board, state.currentPiece.shape, {
    x: state.currentPiece.position.x,
    y: newY + 1,
  })) {
    newY++;
    dropDistance++;
  }
  
  // Add points for hard drop distance
  const hardDropPoints = dropDistance * 2;
  
  const stateWithDrop = {
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
      score: state.stats.score + hardDropPoints
    }
  };
  
  return lockPiece(stateWithDrop);
};

const holdPiece = (state: GameState): GameState => {
  if (!state.canHold || !state.currentPiece || state.gameOver || state.isPaused) return state;
  
  const currentPieceType = state.currentPiece.type;
  let newCurrentPieceType: number;
  let newNextPieces = [...state.nextPieces];
  
  if (state.holdPiece !== null) {
    // Swap with held piece
    newCurrentPieceType = state.holdPiece;
  } else {
    // Take from next pieces
    newCurrentPieceType = state.nextPieces[0];
    newNextPieces = [...state.nextPieces.slice(1), getRandomPiece()];
  }
  
  const spawnPos = getSpawnPosition(newCurrentPieceType);
  const shape = getShapeForRotation(newCurrentPieceType, 0);
  
  return {
    ...state,
    currentPiece: {
      type: newCurrentPieceType,
      shape,
      position: spawnPos,
      rotation: 0
    },
    nextPieces: newNextPieces,
    holdPiece: currentPieceType,
    canHold: false,
  };
};

const gameTick = (state: GameState): GameState => {
  if (state.gameOver || state.isPaused) return state;
  
  // Update game time
  const currentTime = Date.now();
  const gameTime = state.stats.gameTime + (currentTime - (state.stats.startTime || currentTime));
  
  const updatedState = {
    ...state,
    stats: {
      ...state.stats,
      gameTime
    }
  };
  
  // If there's no current piece, spawn a new one
  if (!updatedState.currentPiece) {
    return spawnNewPiece(updatedState);
  }
  
  // Try to move piece down
  return movePiece(updatedState, 0, 1);
};

const buyItem = (state: GameState, itemId: string): GameState => {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item || state.stats.coins < item.price) return state;

  const newSettings = { ...state.settings };
  const newStats = { 
    ...state.stats, 
    coins: state.stats.coins - item.price,
    inventory: {
      ...state.stats.inventory,
      [itemId]: (state.stats.inventory[itemId] || 0) + 1
    }
  };

  // Apply item effects
  if (item.effect.ghostPiece !== undefined) {
    newSettings.ghostPiece = item.effect.ghostPiece;
  }
  if (item.effect.holdPiece !== undefined) {
    newSettings.holdPiece = item.effect.holdPiece;
  }
  if (item.effect.nextPiecesCount !== undefined) {
    newSettings.nextPiecesCount = item.effect.nextPiecesCount;
  }

  return {
    ...state,
    settings: newSettings,
    stats: newStats
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_STATE': {
      const loaded = action.payload as Partial<GameState>;
      return {
        ...state,
        ...loaded,
        board: loaded.board || state.board,
        currentPiece: loaded.currentPiece || null,
        nextPieces: loaded.nextPieces || state.nextPieces,
        holdPiece: loaded.holdPiece ?? state.holdPiece,
        canHold: loaded.canHold ?? true,
        gameOver: loaded.gameOver ?? false,
        isPaused: loaded.isPaused ?? false,
        isStarted: loaded.isStarted ?? false,
        stats: { ...state.stats, ...loaded.stats },
        settings: { ...state.settings, ...loaded.settings },
      };
    }
    
    case 'MOVE_LEFT':
      return canAcceptInput(state) ? movePiece(state, -1, 0) : state;
      
    case 'MOVE_RIGHT':
      return canAcceptInput(state) ? movePiece(state, 1, 0) : state;
      
    case 'ROTATE':
      return canAcceptInput(state) ? rotatePiece(state, true) : state;
      
    case 'SOFT_DROP':
      return canAcceptInput(state) ? movePiece(state, 0, 1) : state;
      
    case 'HARD_DROP':
      return canAcceptInput(state) ? hardDrop(state) : state;
      
    case 'HOLD':
      return canAcceptInput(state) ? holdPiece(state) : state;
      
    case 'PAUSE':
      return {
        ...state,
        isPaused: action.isPaused !== undefined ? action.isPaused : !state.isPaused,
      };
      
    case 'RESET':
    case 'RESET_GAME':
      // Create a fresh game state while preserving high score and settings
      const resetState = {
        ...createDefaultState(),
        stats: {
          ...createDefaultState().stats,
          highScore: state.stats.highScore, // Preserve high score
        },
        settings: { ...state.settings }, // Preserve user settings
      };
      return resetState;
      
    case 'START':
    case 'START_GAME':
      const startState = { 
        ...state, 
        isStarted: true, 
        isPaused: false, 
        gameOver: false,
        stats: {
          ...state.stats,
          startTime: Date.now()
        }
      };
      return startState;
      
    case 'TICK':
      return gameTick(state);
      
    case 'BUY_ITEM':
      return buyItem(state, action.itemId);
      
    case 'GAME_OVER':
      return { 
        ...state, 
        gameOver: true, 
        isPaused: true,
        stats: {
          ...state.stats,
          gameTime: state.stats.gameTime + (Date.now() - (state.stats.startTime || Date.now()))
        }
      };
      
    case 'ADD_SCORE':
      return {
        ...state,
        stats: {
          ...state.stats,
          score: state.stats.score + action.points,
          highScore: Math.max(state.stats.score + action.points, state.stats.highScore)
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

// Helper function to check if game can accept input
const canAcceptInput = (state: GameState): boolean => {
  return !state.gameOver && !state.isPaused && state.isStarted;
};
