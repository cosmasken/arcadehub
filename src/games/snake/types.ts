export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;           // Current grid x position
  y: number;           // Current grid y position
  dx: number;          // Sub-cell x position (0 to 1)
  dy: number;          // Sub-cell y position (0 to 1)
  targetX: number;     // Target grid x position
  targetY: number;     // Target grid y position
  moving: boolean;     // Whether the segment is currently moving
  direction?: Direction; // Current movement direction (for head only)
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  gameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
  score: number;
  highScore: number;
  level: number;
  linesCleared: number;
  coins: number;
  inventory: Record<string, number>;
  achievements: string[];
  settings: GameSettings;
  // Tournament enhancements
  gameStartTime: number;
  gameDuration: number;
  moveCount: number;
  foodEaten: number;
  comboMultiplier: number;
  maxCombo: number;
  perfectMoves: number;
  gameMode: 'classic' | 'timeAttack' | 'survival' | 'targetScore';
  timeLimit?: number; // For time attack mode
  targetScore?: number; // For target score mode
  gameSeed: string; // For deterministic gameplay
}

export interface GameSettings {
  gridSize: number;
  cellSize: number;
  gameSpeed: number;
  theme: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  ghostPiece: boolean;
  wallCollision: boolean;
}

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  changeDirection: (direction: Direction) => void;
  buyItem: (itemId: string) => void;
  claimAchievement: (achievementId: string) => void;
}

export interface TournamentConfig {
  timeLimit?: number; // seconds
  targetScore?: number;
  seed?: string;
  maxPlayers?: number;
}

// Tournament result for blockchain submission
export interface TournamentResult {
  gameId: string;
  playerAddress: string;
  finalScore: number;
  gameDuration: number; // in seconds
  moveCount: number;
  foodEaten: number;
  maxCombo: number;
  perfectMoves: number;
  gameMode: 'classic' | 'timeAttack' | 'survival' | 'targetScore';
  gameStateHash: string; // For verification
  moveHistory: string[]; // Hash of moves for replay
  timestamp: number;
  seed: string; // Game seed used
}

// Enhanced scoring metrics
export interface ScoringMetrics {
  baseScore: number;
  timeBonus: number;
  comboBonus: number;
  skillBonus: number;
  finalScore: number;
  multiplier: number;
}

export type GameAction =
  | { type: 'MOVE' }
  | { type: 'CHANGE_DIRECTION'; direction: Direction }
  | { type: 'EAT_FOOD' }
  | { type: 'GAME_OVER' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'START' }
  | { type: 'INCREASE_SCORE'; points: number }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'START_TOURNAMENT'; gameMode: 'classic' | 'timeAttack' | 'survival' | 'targetScore'; config?: TournamentConfig }
  | { type: 'UPDATE_COMBO'; increment: boolean }
  | { type: 'PERFECT_MOVE' }
  | { type: 'TIME_TICK' };

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'skin' | 'theme' | 'powerup' | 'ability';
  effect: () => void;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  reward: number;
  icon: string;
  unlocked: boolean;
}
