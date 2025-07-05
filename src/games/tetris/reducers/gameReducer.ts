import { GameState, GameAction } from '../types';
import { COLS, ROWS, SHAPES, POINTS, LEVELS } from '../constants';
import { createBoard,getRandomPiece } from '../initialState';
import { rotatePiece, hardDrop,holdPiece,lockPiece,spawnNewPiece,buyItem } from '../utils/gameReducers';

// Helper function to create initial state while preserving certain values from previous state
const createInitialState = (state: GameState): GameState => {
  // Preserve only the high score from the previous state
  const highScore = state.stats?.highScore || 0;
  
  return {
    // Start with a clean board
    board: createBoard(),
    currentPiece: null,
    nextPieces: Array(3).fill(0).map(getRandomPiece),
    holdPiece: null,
    canHold: true,
    
    // Reset all game state flags
    gameOver: false,
    isPaused: false,
    isStarted: false,
    
    // Reset all stats but preserve high score
    stats: {
      score: 0,
      highScore: Math.max(state.stats?.score || 0, highScore),
      level: 1,
      linesCleared: 0,
      tetrisCount: 0,
      totalPieces: 0,
      startTime: Date.now(),
      gameTime: 0,
      lastLevelUp: 0,
      // Preserve achievements and inventory from previous state
      achievements: state.stats?.achievements || [],
      inventory: state.stats?.inventory || {},
      coins: state.stats?.coins || 0
    },
    
    // Preserve settings from previous state
    settings: {
      ghostPiece: state.settings?.ghostPiece !== undefined ? state.settings.ghostPiece : true,
      holdPiece: state.settings?.holdPiece !== undefined ? state.settings.holdPiece : true,
      nextPiecesCount: state.settings?.nextPiecesCount || 3,
      theme: state.settings?.theme || 'default',
      soundEnabled: state.settings?.soundEnabled !== undefined ? state.settings.soundEnabled : true,
      musicEnabled: state.settings?.musicEnabled !== undefined ? state.settings.musicEnabled : true,
      controls: state.settings?.controls || {
        moveLeft: 'ArrowLeft',
        moveRight: 'ArrowRight',
        rotate: 'ArrowUp',
        softDrop: 'ArrowDown',
        hardDrop: 'Space',
        hold: 'KeyC',
        pause: 'KeyP'
      }
    }
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MOVE_LEFT': {
      if (!state.currentPiece || state.gameOver || state.isPaused) return state;
      const leftPosition = {
        ...state.currentPiece.position,
        x: state.currentPiece.position.x - 1,
      };
      if (isValidMove(state.board, state.currentPiece.shape, leftPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: leftPosition,
          },
        };
      }
      return state;
    }

    case 'MOVE_RIGHT': {
      if (!state.currentPiece || state.gameOver || state.isPaused) return state;
      const rightPosition = {
        ...state.currentPiece.position,
        x: state.currentPiece.position.x + 1,
      };
      if (isValidMove(state.board, state.currentPiece.shape, rightPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: rightPosition,
          },
        };
      }
      return state;
    }

    case 'ROTATE': {
      return rotatePiece(state);
    }

    case 'SOFT_DROP': {
      if (!state.currentPiece || state.gameOver || state.isPaused) return state;
      const downPosition = {
        ...state.currentPiece.position,
        y: state.currentPiece.position.y + 1,
      };
      if (isValidMove(state.board, state.currentPiece.shape, downPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: downPosition,
          },
          stats: {
            ...state.stats,
            score: state.stats.score + POINTS.SOFT_DROP,
          },
        };
      }
      return state;
    }

    case 'HARD_DROP': {
      return hardDrop(state);
    }

    case 'HOLD': {
      return holdPiece(state);
    }

    case 'PAUSE': {
      return { ...state, isPaused: !state.isPaused };
    }

    case 'RESET': {
      return createInitialState(state);
    }

    case 'START': {
      return {
        ...state,
        isStarted: true,
        isPaused: false,
        stats: {
          ...state.stats,
          startTime: Date.now(),
        },
      };
    }

    case 'TICK': {
      if (!state.currentPiece) {
        return spawnNewPiece(state);
      }
      const tickPosition = {
        ...state.currentPiece.position,
        y: state.currentPiece.position.y + 1,
      };
      if (isValidMove(state.board, state.currentPiece.shape, tickPosition)) {
        return {
          ...state,
          currentPiece: {
            ...state.currentPiece,
            position: tickPosition,
          },
        };
      }
      return lockPiece(state);
    }

    case 'BUY_ITEM': {
      return buyItem(state, action.itemId);
    }

    default: {
      return state;
    }
  }
};

// Helper functions
const isValidMove = (board: number[][], shape: number[][], position: {x: number, y: number}): boolean => {
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

// Other helper functions from context.tsx can be imported here
