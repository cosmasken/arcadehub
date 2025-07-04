import { GameState, GameAction } from './types';
import { COLS, ROWS, SHAPES, POINTS, LEVELS, SHOP_ITEMS } from './constants';

// Standard SRS Wall Kick Data
// Format: [initial rotation] -> [next rotation]: [test1, test2, test3, test4, test5]
const WALL_KICK_TESTS = {
  // J, L, S, T, Z pieces
  JLSTZ: [
    // 0>>1 (0° -> 90°)
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    // 1>>2 (90° -> 180°)
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    // 2>>3 (180° -> 270°)
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    // 3>>0 (270° -> 0°)
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
  ],
  // I piece has different wall kicks
  I: [
    // 0>>1
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    // 1>>2
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    // 2>>3
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    // 3>>0
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
  ]
};

// For counter-clockwise rotation (not currently used but here for completeness)
const WALL_KICK_TESTS_CCW = {
  JLSTZ: WALL_KICK_TESTS.JLSTZ.map((_, i, arr) => arr[(i + 1) % 4]),
  I: WALL_KICK_TESTS.I.map((_, i, arr) => arr[(i + 1) % 4])
};

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

const isValidMove = (board: number[][], shape: number[][], position: {x: number, y: number}): boolean => {
  // Check if shape is empty
  if (!shape.length || !shape[0]?.length) return false;
  
  // Check each cell of the shape
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // Skip empty cells in the shape
      if (shape[y][x] === 0) continue;
      
      // Calculate board position
      const boardX = position.x + x;
      const boardY = position.y + y;
      
      // Check boundaries
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
        return false; // Out of bounds
      }
      
      // Check if position is above the board (spawn area)
      if (boardY < 0) {
        continue;
      }
      
      // Check for collision with existing pieces
      if (board[boardY][boardX] !== 0) {
        return false; // Collision with existing piece
      }
    }
  }
  
  return true; // No collisions or boundaries hit
};

// SRS: always rotate the base shape from SHAPES, not the current shape
const getSRSShape = (type: number, rotation: number): number[][] => {
  const shape = SHAPES[type];
  let result = shape;
  for (let i = 0; i < rotation; i++) {
    result = rotateMatrix(result, true);
  }
  return result;
};

const rotateMatrix = (matrix: number[][], clockwise: boolean = true): number[][] => {
  if (!matrix.length || !matrix[0]?.length) return matrix;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array(cols).fill(0).map(() => Array(rows).fill(0));
  if (clockwise) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = matrix[y][x];
      }
    }
  } else {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[cols - 1 - x][y] = matrix[y][x];
      }
    }
  }
  return rotated;
};

const spawnNewPiece = (state: GameState): GameState => {
  const newPiece = {
    type: state.nextPieces[0],
    shape: SHAPES[state.nextPieces[0]],
    position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    rotation: 0, // Initial rotation state
  };
  
  const nextPieces = [...state.nextPieces.slice(1), getRandomPiece()];
  
  // Check if the new piece can be placed
  if (!isValidMove(state.board, newPiece.shape, newPiece.position)) {
    return { ...state, gameOver: true };
  }
  
  return {
    ...state,
    currentPiece: newPiece,
    nextPieces,
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
        if (boardY >= 0) { // Only add if it's within the visible board
          newBoard[boardY][boardX] = type;
        }
      }
    }
  }
  
  // Check for completed lines
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (newBoard[y].every(cell => cell !== 0)) {
      // Remove the line and add a new empty one at the top
      newBoard.splice(y, 1);
      newBoard.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // Check the same row again since we moved everything down
    }
  }
  
  // Calculate score
  const linePoints = [0, 100, 300, 500, 800]; // Points for 0-4 lines
  const points = linePoints[Math.min(linesCleared, linePoints.length - 1)];
  const score = state.stats.score + (points * (state.stats.level + 1));
  
  // Calculate level
  const newLines = state.stats.linesCleared + linesCleared;
  const level = Math.min(
    Math.floor(newLines / 10) + 1,
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
      linesCleared: newLines,
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

  if (dy > 0 && !isValidMove(state.board, state.currentPiece.shape, newPosition)) {
    return lockPiece(state);
  }

  if (isValidMove(state.board, state.currentPiece.shape, newPosition)) {
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
  const currentRotation = rotation % 4;
  const nextRotation = clockwise ? (currentRotation + 1) % 4 : (currentRotation + 3) % 4;

  // Always rotate from base shape using SRS
  const rotatedShape = getSRSShape(type, nextRotation);
  const isIPiece = type === 1; // I piece
  const kickSet = isIPiece ? WALL_KICK_TESTS.I : WALL_KICK_TESTS.JLSTZ;
  const kickTests = clockwise
    ? kickSet[currentRotation]
    : (isIPiece ? WALL_KICK_TESTS_CCW.I : WALL_KICK_TESTS_CCW.JLSTZ)[currentRotation];

  for (const [dx, dy] of kickTests) {
    const newPosition = {
      x: position.x + dx,
      y: position.y + dy
    };
    if (isValidMove(state.board, rotatedShape, newPosition)) {
      return {
        ...state,
        currentPiece: {
          ...state.currentPiece,
          shape: rotatedShape,
          position: newPosition,
          rotation: nextRotation
        }
      };
    }
  }
  return state; // No valid rotation found
};

const hardDrop = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;
  
  let newY = state.currentPiece.position.y;
  while (isValidMove(state.board, state.currentPiece.shape, {
    x: state.currentPiece.position.x,
    y: newY + 1,
  })) {
    newY++;
  }
  
  return lockPiece({
    ...state,
    currentPiece: {
      ...state.currentPiece,
      position: {
        ...state.currentPiece.position,
        y: newY,
      },
    },
  });
};

const holdPiece = (state: GameState): GameState => {
  if (!state.canHold || state.gameOver || state.isPaused) return state;
  
  const newHoldPiece = state.currentPiece?.type || null;
  let newCurrentPiece = state.nextPieces[0];
  const newNextPieces = [...state.nextPieces.slice(1), getRandomPiece()];
  
  if (state.holdPiece !== null) {
    newCurrentPiece = state.holdPiece;
  }
  
  return {
    ...state,
    currentPiece: {
      type: newCurrentPiece,
      shape: SHAPES[newCurrentPiece],
      position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    },
    nextPieces: newNextPieces,
    holdPiece: newHoldPiece,
    canHold: false,
  };
};

const gameTick = (state: GameState): GameState => {
  if (state.gameOver || state.isPaused) return state;
  
  // If there's no current piece, spawn a new one
  if (!state.currentPiece) {
    return spawnNewPiece(state);
  }
  
  // Try to move piece down
  const newState = movePiece(state, 0, 1);
  
  // If piece didn't move down, lock it in place
  if (newState === state) {
    return lockPiece(state);
  }
  
  return newState;
};

const buyItem = (state: GameState, itemId: string): GameState => {
  // Find the item in the shop
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return state;

  // Only update if user can afford it, etc. (omitted for brevity)
  const newSettings = { ...state.settings };
  if (itemId === 'ghost_piece') {
    newSettings.ghostPiece = true;
  }
  // Add similar logic for other upgrades if needed

  // Deduct coins, add to inventory, etc. (omitted for brevity)
  return {
    ...state,
    settings: newSettings,
    // You may want to update stats.inventory, stats.coins, etc.
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_STATE': {
      // Defensive: ensure all required fields exist, fallback to current state if not
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
      // This will be handled by the context provider
      return state;
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
