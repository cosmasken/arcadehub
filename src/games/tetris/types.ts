// Game state types
export type Position = { x: number; y: number };
export type Tetromino = number[][];

export interface GameState {
  board: number[][];
  currentPiece: {
    shape: Tetromino;
    position: Position;
    type: number;
  } | null;
  nextPieces: number[];
  holdPiece: number | null;
  canHold: boolean;
  gameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
  stats: GameStats;
  settings: GameSettings;
}

export interface GameStats {
  score: number;
  level: number;
  linesCleared: number;
  tetrisCount: number;
  totalPieces: number;
  startTime: number;
  gameTime: number;
  lastLevelUp: number;
  highScore: number;
  achievements: string[];
  inventory: Record<string, number>;
  coins: number;
}

export interface GameSettings {
  ghostPiece: boolean;
  holdPiece: boolean;
  nextPiecesCount: number;
  theme: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  controls: {
    moveLeft: string;
    moveRight: string;
    rotate: string;
    softDrop: string;
    hardDrop: string;
    hold: string;
    pause: string;
  };
}

// Union of all possible effect types
type ShopItemEffect = 
  | { ghostPiece: boolean }
  | { holdPiece: boolean }
  | { nextPieces: number }
  | { theme: string };

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'upgrade' | 'theme' | 'powerup';
  maxLevel?: number;
  effect: ShopItemEffect;
  icon: string;
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  reward: number;
  icon: string;
}

export interface LevelConfig {
  level: number;
  linesToClear: number;
  speed: number;
  color: string;
  name: string;
}

export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'HOLD' }
  | { type: 'PAUSE'; isPaused?: boolean }
  | { type: 'RESET' | 'RESET_GAME' }
  | { type: 'START' | 'START_GAME' }
  | { type: 'TICK' }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'GAME_OVER' }
  | { type: 'ADD_SCORE'; points: number }
  | { type: 'ADD_LINES'; lines: number };

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  buyItem: (itemId: string) => void;
  claimAchievement: (achievementId: string) => void;
  saveGame: () => void;
  loadGame: () => void;
  isValidMove: (board: number[][], shape: number[][], position: Position) => boolean;
}
