import { COLS, ROWS } from './constants';
import { GameState } from './types';

export const createBoard = (): number[][] => {
  const board: number[][] = [];
  for (let i = 0; i < ROWS; i++) {
    board.push(Array(COLS).fill(0));
  }
  return board;
};

export const getRandomPiece = (): number => 
  Math.floor(Math.random() * 6) + 1; // 1-7 pieces (0 is empty)

export const getInitialState = (): GameState => {
  const savedState = localStorage.getItem('tetris-save');
  
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
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
      startTime: Date.now(),
      gameTime: 0,
      lastLevelUp: 0,
      highScore: 0,
      achievements: [],
      inventory: {},
      coins: 0,
    },
    settings: {
      ghostPiece: true,
      holdPiece: true,
      nextPiecesCount: 3,
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
        pause: 'Escape',
      },
    },

  };
};
