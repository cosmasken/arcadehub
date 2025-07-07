// Game dimensions and grid
export const GRID_SIZE = 20;
export const MAZE_WIDTH = 19;
export const MAZE_HEIGHT = 21;
export const CANVAS_WIDTH = MAZE_WIDTH * GRID_SIZE;
export const CANVAS_HEIGHT = MAZE_HEIGHT * GRID_SIZE;

// Game speeds (pixels per frame)
export const PACMAN_SPEED = 2;
export const GHOST_SPEED = 1.8;
export const GHOST_SCARED_SPEED = 1;

// Game timing (in milliseconds)
export const POWER_PELLET_DURATION = 10000; // 10 seconds
export const GHOST_SCATTER_TIME = 7000; // 7 seconds
export const GHOST_CHASE_TIME = 20000; // 20 seconds

// Scoring
export const SCORES = {
  DOT: 10,
  POWER_PELLET: 50,
  GHOST: [200, 400, 800, 1600], // Progressive ghost eating scores
  FRUIT: 100,
  EXTRA_LIFE: 10000
};

// Colors
export const COLORS = {
  WALL: '#0000FF',
  DOT: '#FFFF00',
  POWER_PELLET: '#FFFF00',
  PACMAN: '#FFFF00',
  BACKGROUND: '#000000',
  GHOSTS: {
    BLINKY: '#FF0000', // Red
    PINKY: '#FFB8FF',  // Pink
    INKY: '#00FFFF',   // Cyan
    CLYDE: '#FFB852'   // Orange
  },
  SCARED_GHOST: '#0000FF',
  SCARED_GHOST_FLASH: '#FFFFFF'
};

// Directions
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  NONE: { x: 0, y: 0 }
} as const;

export type Direction = keyof typeof DIRECTIONS;

// Maze layout (1 = wall, 0 = empty, 2 = dot, 3 = power pellet, 4 = ghost house)
export const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,4,4,4,0,1,2,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,4,4,4,0,0,2,0,0,0,0,0],
  [1,1,1,1,1,2,1,0,4,4,4,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game states
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete'
} as const;

export type GameState = typeof GAME_STATES[keyof typeof GAME_STATES];

// Ghost modes
export const GHOST_MODES = {
  SCATTER: 'scatter',
  CHASE: 'chase',
  SCARED: 'scared',
  EATEN: 'eaten'
} as const;

export type GhostMode = typeof GHOST_MODES[keyof typeof GHOST_MODES];

// Starting positions
export const START_POSITIONS = {
  PACMAN: { x: 9, y: 15 },
  BLINKY: { x: 9, y: 9 },
  PINKY: { x: 9, y: 10 },
  INKY: { x: 8, y: 10 },
  CLYDE: { x: 10, y: 10 }
};

// Ghost target corners for scatter mode
export const SCATTER_TARGETS = {
  BLINKY: { x: 18, y: 0 },
  PINKY: { x: 0, y: 0 },
  INKY: { x: 18, y: 20 },
  CLYDE: { x: 0, y: 20 }
};
