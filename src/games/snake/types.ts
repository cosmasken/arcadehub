export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
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
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string };

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
