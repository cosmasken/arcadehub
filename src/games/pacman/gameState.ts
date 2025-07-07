import { 
  MAZE_LAYOUT, 
  START_POSITIONS, 
  COLORS, 
  PACMAN_SPEED, 
  GHOST_SPEED,
  GAME_STATES,
  GHOST_MODES,
  DIRECTIONS,
  GRID_SIZE
} from './constants';
import { PacmanGameState, PacmanEntity, GhostEntity } from './types';

export const createInitialPacman = (): PacmanEntity => ({
  position: { 
    x: START_POSITIONS.PACMAN.x * GRID_SIZE, 
    y: START_POSITIONS.PACMAN.y * GRID_SIZE 
  },
  direction: 'NONE',
  nextDirection: 'NONE',
  speed: PACMAN_SPEED,
  isAlive: true,
  mouthOpen: true,
  animationFrame: 0
});

export const createInitialGhosts = (): GhostEntity[] => [
  {
    id: 'BLINKY',
    position: { 
      x: START_POSITIONS.BLINKY.x * GRID_SIZE, 
      y: START_POSITIONS.BLINKY.y * GRID_SIZE 
    },
    direction: 'UP',
    speed: GHOST_SPEED,
    mode: GHOST_MODES.SCATTER,
    color: COLORS.GHOSTS.BLINKY,
    scaredTimer: 0,
    target: { x: 0, y: 0 },
    inHouse: true, // Start Blinky in house too to prevent immediate collision
    exitTimer: 500 // Short delay before exit
  },
  {
    id: 'PINKY',
    position: { 
      x: START_POSITIONS.PINKY.x * GRID_SIZE, 
      y: START_POSITIONS.PINKY.y * GRID_SIZE 
    },
    direction: 'UP',
    speed: GHOST_SPEED,
    mode: GHOST_MODES.SCATTER,
    color: COLORS.GHOSTS.PINKY,
    scaredTimer: 0,
    target: { x: 0, y: 0 },
    inHouse: true,
    exitTimer: 1000
  },
  {
    id: 'INKY',
    position: { 
      x: START_POSITIONS.INKY.x * GRID_SIZE, 
      y: START_POSITIONS.INKY.y * GRID_SIZE 
    },
    direction: 'UP',
    speed: GHOST_SPEED,
    mode: GHOST_MODES.SCATTER,
    color: COLORS.GHOSTS.INKY,
    scaredTimer: 0,
    target: { x: 0, y: 0 },
    inHouse: true,
    exitTimer: 2000
  },
  {
    id: 'CLYDE',
    position: { 
      x: START_POSITIONS.CLYDE.x * GRID_SIZE, 
      y: START_POSITIONS.CLYDE.y * GRID_SIZE 
    },
    direction: 'UP',
    speed: GHOST_SPEED,
    mode: GHOST_MODES.SCATTER,
    color: COLORS.GHOSTS.CLYDE,
    scaredTimer: 0,
    target: { x: 0, y: 0 },
    inHouse: true,
    exitTimer: 3000
  }
];

export const createInitialMaze = (): number[][] => {
  return MAZE_LAYOUT.map(row => [...row]);
};

export const countDots = (maze: number[][]): number => {
  let count = 0;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 2 || maze[y][x] === 3) { // dots and power pellets
        count++;
      }
    }
  }
  return count;
};

export const createInitialGameState = (): PacmanGameState => {
  const maze = createInitialMaze();
  const pacman = createInitialPacman();
  const ghosts = createInitialGhosts();
  
  return {
    gameState: GAME_STATES.MENU,
    level: 1,
    score: 0,
    lives: 3,
    highScore: parseInt(localStorage.getItem('pacman-high-score') || '0'),
    
    pacman,
    ghosts,
    
    maze,
    dotsRemaining: countDots(maze),
    powerPelletActive: false,
    powerPelletTimer: 0,
    
    gameTime: 0,
    lastFrameTime: 0,
    
    ghostModeTimer: 0,
    currentGhostMode: 'scatter',
    
    ghostEatenCount: 0,
    
    inputDirection: 'NONE',
    
    soundEnabled: true,
    musicEnabled: true
  };
};

export const resetGameEntities = (state: PacmanGameState): PacmanGameState => {
  return {
    ...state,
    pacman: createInitialPacman(),
    ghosts: createInitialGhosts(),
    powerPelletActive: false,
    powerPelletTimer: 0,
    ghostEatenCount: 0,
    inputDirection: 'NONE'
  };
};

export const nextLevel = (state: PacmanGameState): PacmanGameState => {
  const newMaze = createInitialMaze();
  const newLevel = state.level + 1;
  
  // Increase difficulty with each level
  const speedMultiplier = Math.min(1 + (newLevel - 1) * 0.1, 2.0); // Max 2x speed
  const powerPelletDuration = Math.max(5000, 10000 - (newLevel - 1) * 500); // Shorter power pellet time
  
  const newPacman = createInitialPacman();
  newPacman.speed = Math.floor(newPacman.speed * speedMultiplier);
  
  const newGhosts = createInitialGhosts().map(ghost => ({
    ...ghost,
    speed: Math.floor(ghost.speed * speedMultiplier),
    exitTimer: Math.max(ghost.exitTimer - (newLevel - 1) * 100, 200) // Faster exits
  }));
  
  return {
    ...resetGameEntities(state),
    level: newLevel,
    maze: newMaze,
    dotsRemaining: countDots(newMaze),
    gameState: GAME_STATES.PLAYING,
    pacman: newPacman,
    ghosts: newGhosts,
    // Bonus points for completing level
    score: state.score + (newLevel - 1) * 1000
  };
};
