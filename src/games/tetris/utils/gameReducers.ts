import { GameState } from '../types';
import { SHAPES, COLS, ROWS, createBoard, getRandomPiece, isValidMove, rotateMatrix } from './gameUtils';

export const movePiece = (state: GameState, dx: number, dy: number): GameState => {
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

export const rotatePiece = (state: GameState): GameState => {
  if (!state.currentPiece || state.gameOver || state.isPaused) return state;
  
  const rotatedShape = rotateMatrix(state.currentPiece.shape);
  
  // Try wall kicks (shift piece left/right if rotation would cause collision)
  const kicks = [0, -1, 1, -2, 2];
  for (const offset of kicks) {
    const newPosition = {
      ...state.currentPiece.position,
      x: state.currentPiece.position.x + offset,
    };
    
    if (isValidMove(state.board, rotatedShape, newPosition)) {
      return {
        ...state,
        currentPiece: {
          ...state.currentPiece,
          shape: rotatedShape,
          position: newPosition,
        },
      };
    }
  }
  
  return state;
};

export const hardDrop = (state: GameState): GameState => {
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

export const holdPiece = (state: GameState): GameState => {
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

export const gameTick = (state: GameState): GameState => {
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

export const lockPiece = (state: GameState): GameState => {
  if (!state.currentPiece) return state;
  
  // Create a new board with the locked piece
  const newBoard = state.board.map(row => [...row]);
  const { shape, position } = state.currentPiece;
  
  // Add piece to the board
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardY = position.y + y;
        const boardX = position.x + x;
        if (boardY >= 0) { // Only add if it's within the visible board
          newBoard[boardY][boardX] = state.currentPiece.type;
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
  const score = state.stats.score + (linePoints[linesCleared] * (state.stats.level + 1));
  
  // Calculate level
  const newLines = state.stats.linesCleared + linesCleared;
  const level = Math.floor(newLines / 10) + 1;
  
  // Check for game over (if piece is above the board)
  const gameOver = position.y < 0;
  
  return {
    ...state,
    board: newBoard,
    currentPiece: null,
    canHold: true,
    gameOver,
    stats: {
      ...state.stats,
      score,
      level,
      linesCleared: newLines,
      highScore: Math.max(score, state.stats.highScore),
    },
  };
};

export const spawnNewPiece = (state: GameState): GameState => {
  const newPiece = {
    type: state.nextPieces[0],
    shape: SHAPES[state.nextPieces[0]],
    position: { x: Math.floor(COLS / 2) - 1, y: 0 },
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

export const buyItem = (state: GameState, itemId: string): GameState => {
  // This is a placeholder - implement your shop item logic here
  return state;
};
