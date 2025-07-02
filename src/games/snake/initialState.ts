import { GRID_SIZE, INITIAL_GAME_SPEED, DIRECTIONS } from './constants';
import { GameState, Position, Direction } from './types';

export const getRandomPosition = (direction: Direction = 'RIGHT'): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
  dx: 0,
  dy: 0,
  targetX: 0,
  targetY: 0,
  moving: false,
  direction
});

export const getInitialState = (): GameState => {
  return {
    // Game state
    snake: [{
      x: 10,
      y: 10,
      dx: 0,
      dy: 0,
      targetX: 10,
      targetY: 10,
      moving: false,
      direction: 'RIGHT' as const
    }],
    food: getRandomPosition(),
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    gameOver: false,
    isPaused: false,
    isStarted: false,
    
    // UI state
    isLoading: true, // Show splash screen by default
    showMenu: true, // Show menu by default
    menuType: 'start' as const, // Default to start menu
    showTooltip: false, // Hide tooltip by default
    tooltipMessage: '', // Empty tooltip message
    tooltipDuration: 3000, // Default tooltip duration
    
    // Scoring and progress
    score: 0,
    highScore: Number(localStorage.getItem('snake-highscore')) || 0,
    level: 1,
    linesCleared: 0,
    foodEaten: 0,
    moveCount: 0,
    
    // Game economy
    coins: 0,
    inventory: {},
    achievements: [],
    
    // Settings
    settings: {
      gridSize: GRID_SIZE,
      cellSize: 20,
      gameSpeed: INITIAL_GAME_SPEED,
      theme: 'classic',
      soundEnabled: true,
      musicEnabled: true,
      ghostPiece: false,
      wallCollision: true,
    },
    
    // Tournament enhancements
    gameStartTime: 0,
    gameDuration: 0,
    comboMultiplier: 1,
    maxCombo: 0,
    perfectMoves: 0,
    gameMode: 'classic',
    timeLimit: undefined,
    targetScore: undefined,
    gameSeed: Math.random().toString(36).substring(2, 15), // Random seed
  };
};
