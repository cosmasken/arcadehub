import { ShopItem } from './types';

// Game constants
export const COLS = 10;
export const ROWS = 22; // Slightly taller board for better gameplay
export const BLOCK = 40; // Increased block size for better visibility
export const GAME_SPEED = 1000; // ms

// Colors for each tetromino type
export const COLORS = [
  '#0f0f14',  // empty (darker background for better contrast)
  '#00F0FF',  // I - Brighter Cyan
  '#3366FF',  // J - Brighter Blue
  '#FF8C00',  // L - Brighter Orange
  '#FFEE33',  // O - Brighter Yellow
  '#33FF33',  // S - Brighter Green
  '#CC33FF',  // T - Brighter Purple
  '#FF3333',  // Z - Brighter Red
];

// Tetromino shapes
export const SHAPES = [
  [],
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]], // Z
];

// Game levels configuration
export const LEVELS = [
  { level: 1, linesToClear: 10, speed: 2000, color: '#4CAF50', name: 'Beginner' },     // 2 seconds
  { level: 2, linesToClear: 30, speed: 1750, color: '#2196F3', name: 'Apprentice' },  // 1.75s
  { level: 3, linesToClear: 60, speed: 1500, color: '#9C27B0', name: 'Adept' },       // 1.5s
  { level: 4, linesToClear: 100, speed: 1300, color: '#FF9800', name: 'Expert' },     // 1.3s
  { level: 5, linesToClear: 150, speed: 1100, color: '#F44336', name: 'Master' },     // 1.1s
  { level: 6, linesToClear: 200, speed: 900, color: '#E91E63', name: 'Grand Master' }, // 0.9s
  { level: 7, linesToClear: 300, speed: 750, color: '#9C27B0', name: 'Legend' },      // 0.75s
  { level: 8, linesToClear: 500, speed: 600, color: '#FF5722', name: 'Mythic' },      // 0.6s
];

// Points system
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};


// Shop items
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'ghost_piece',
    name: 'Ghost Piece',
    description: 'Shows where the piece will land',
    price: 1000,
    type: 'upgrade',
    maxLevel: 1,
    effect: { ghostPiece: true },
    icon: '👻',
  },
  {
    id: 'hold_piece',
    name: 'Hold Piece',
    description: 'Store a piece to use later',
    price: 1500,
    type: 'upgrade',
    maxLevel: 1,
    effect: { holdPiece: true },
    icon: '✋',
  },
  {
    id: 'next_pieces',
    name: 'Next Pieces Preview',
    description: 'See the next 3 pieces',
    price: 2000,
    type: 'upgrade',
    maxLevel: 3,
    effect: { nextPiecesCount: 3 },
    icon: '🔍',
  },
  {
    id: 'soft_drop_boost',
    name: 'Soft Drop Boost',
    description: 'Earn more points from soft drops',
    price: 3000,
    type: 'upgrade',
    maxLevel: 3,
    effect: { softDropMultiplier: 2 },
    icon: '⬇️',
  },
  {
    id: 'hard_drop_boost',
    name: 'Hard Drop Boost',
    description: 'Earn more points from hard drops',
    price: 3500,
    type: 'upgrade',
    maxLevel: 3,
    effect: { hardDropMultiplier: 2 },
    icon: '⏬',
  },
  {
    id: 'combo_boost',
    name: 'Combo Boost',
    description: 'Earn bonus points for consecutive line clears',
    price: 5000,
    type: 'upgrade',
    maxLevel: 3,
    effect: { comboMultiplier: 1.5 },
    icon: '🔥',
  },
  {
    id: 'theme_retro',
    name: 'Retro Theme',
    description: 'Classic retro theme',
    price: 2500,
    type: 'theme',
    maxLevel: 1,
    effect: { theme: 'retro' },
    icon: '👾',
  },
  {
    id: 'theme_neon',
    name: 'Neon Theme',
    description: 'Bright neon theme',
    price: 3000,
    type: 'theme',
    maxLevel: 1,
    effect: { theme: 'neon' },
    icon: '🌈',
  },
  {
    id: 'theme_dark',
    name: 'Dark Theme',
    description: 'Dark mode theme',
    price: 2500,
    type: 'theme',
    effect: { theme: 'dark' },
    icon: '🌙',
  },
];

// Achievements
export const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Clear your first line',
    condition: (stats: GameStats) => stats.linesCleared >= 1,
    reward: 100,
    icon: '🩸',
  },
  {
    id: 'tetris_master',
    name: 'Tetris Master',
    description: 'Clear 4 lines at once',
    condition: (stats: GameStats) => stats.tetrisCount > 0,
    reward: 500,
    icon: '🎯',
  },
  {
    id: 'speed_racer',
    name: 'Speed Racer',
    description: 'Reach level 5',
    condition: (stats: GameStats) => stats.level >= 5,
    reward: 1000,
    icon: '⚡',
  },
  {
    id: 'line_clearer',
    name: 'Line Clearer',
    description: 'Clear 100 lines',
    condition: (stats: GameStats) => stats.linesCleared >= 100,
    reward: 2000,
    icon: '🧹',
  },
  {
    id: 'point_millionaire',
    name: 'Point Millionaire',
    description: 'Score 1,000,000 points',
    condition: (stats: GameStats) => stats.score >= 1000000,
    reward: 10000,
    icon: '💰',
  },
];

// Game stats interface
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
