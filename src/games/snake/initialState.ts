import { GRID_SIZE, INITIAL_GAME_SPEED, DIRECTIONS, LEVELS } from './constants';
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

// Function to generate random obstacles
export const generateObstacles = (level: number, snake: Position[], food: Position): Position[] => {
  const currentLevel = LEVELS[level - 1];
  if (!currentLevel.hasObstacles) return [];
  
  const obstacles: Position[] = [];
  const occupied = new Set<string>();
  
  // Mark snake and food positions as occupied
  snake.forEach(segment => {
    occupied.add(`${segment.x},${segment.y}`);
  });
  occupied.add(`${food.x},${food.y}`);

  // Add edge wall obstacles if wall pass is not allowed
  if (!currentLevel.allowWallPass) {
    // Top and bottom rows
    for (let x = 0; x < GRID_SIZE; x++) {
      [0, GRID_SIZE - 1].forEach(y => {
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
          obstacles.push({
            x,
            y,
            dx: 0,
            dy: 0,
            targetX: x,
            targetY: y,
            moving: false,
            direction: 'RIGHT' as const
          });
          occupied.add(key);
        }
      });
    }
    // Left and right columns (excluding corners already added)
    for (let y = 1; y < GRID_SIZE - 1; y++) {
      [0, GRID_SIZE - 1].forEach(x => {
        const key = `${x},${y}`;
        if (!occupied.has(key)) {
          obstacles.push({
            x,
            y,
            dx: 0,
            dy: 0,
            targetX: x,
            targetY: y,
            moving: false,
            direction: 'RIGHT' as const
          });
          occupied.add(key);
        }
      });
    }
  }

  // Generate internal obstacles
  for (let i = 0; i < currentLevel.obstacleCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 100;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
      attempts++;
      if (attempts >= maxAttempts) break;
    } while (
      occupied.has(`${x},${y}`) ||
      x < 2 || x >= GRID_SIZE - 2 ||
      y < 2 || y >= GRID_SIZE - 2
    );
    if (attempts < maxAttempts) {
      obstacles.push({
        x,
        y,
        dx: 0,
        dy: 0,
        targetX: x,
        targetY: y,
        moving: false,
        direction: 'RIGHT' as const
      });
      occupied.add(`${x},${y}`);
    }
  }

  return obstacles;
};

export const getInitialState = (level: number = 1): GameState => {
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
    obstacles: [], // Will be populated after snake and food are set
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    gameOver: false,
    isPaused: false,
    isStarted: false,
    
    // UI state
    isLoading: true, // Show splash screen by default
    showMenu: true, // Show menu by default
    menuType: 'start' as const, // Default to start menu
    // Removed tooltip related state
    
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
    timeLimit: LEVELS[level - 1]?.timeLimit,
    targetScore: undefined,
    gameSeed: Math.random().toString(36).substring(2, 15), // Random seed
  };
};
