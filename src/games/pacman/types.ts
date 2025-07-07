import { Direction, GameState, GhostMode } from './constants';

export interface Position {
  x: number;
  y: number;
}

export interface GameEntity {
  position: Position;
  direction: Direction;
  nextDirection?: Direction;
  speed: number;
}

export interface PacmanEntity extends GameEntity {
  isAlive: boolean;
  mouthOpen: boolean;
  animationFrame: number;
}

export interface GhostEntity extends GameEntity {
  id: 'BLINKY' | 'PINKY' | 'INKY' | 'CLYDE';
  mode: GhostMode;
  color: string;
  scaredTimer: number;
  target: Position;
  inHouse: boolean;
  exitTimer: number;
}

export interface PacmanGameState {
  gameState: GameState;
  level: number;
  score: number;
  lives: number;
  highScore: number;
  
  // Game entities
  pacman: PacmanEntity;
  ghosts: GhostEntity[];
  
  // Game world
  maze: number[][];
  dotsRemaining: number;
  powerPelletActive: boolean;
  powerPelletTimer: number;
  
  // Timing
  gameTime: number;
  lastFrameTime: number;
  
  // Ghost behavior
  ghostModeTimer: number;
  currentGhostMode: 'scatter' | 'chase';
  
  // Scoring
  ghostEatenCount: number;
  
  // Input
  inputDirection: Direction;
  
  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface GameAction {
  type: 'MOVE_PACMAN' | 'UPDATE_GHOSTS' | 'EAT_DOT' | 'EAT_POWER_PELLET' | 
        'EAT_GHOST' | 'LOSE_LIFE' | 'NEXT_LEVEL' | 'PAUSE' | 'RESUME' | 
        'RESTART' | 'SET_DIRECTION' | 'UPDATE_GAME_TIME' | 'TOGGLE_SOUND';
  payload?: any;
}

export interface CollisionResult {
  collision: boolean;
  type?: 'wall' | 'dot' | 'power_pellet' | 'ghost' | 'fruit';
  position?: Position;
}

export interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost
  parent?: PathNode;
}
