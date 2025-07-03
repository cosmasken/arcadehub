import { ShopItem, Achievement, LevelConfig } from './types';

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_GAME_SPEED = 150; // ms

export const THEMES = {
  CLASSIC: 'classic',
  DARK: 'dark',
  NATURE: 'nature',
  RETRO: 'retro',
};

export const DIRECTIONS = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

export const FOOD_TYPES = {
  APPLE_RED: 'apple_red',
  APPLE_GREEN: 'apple_green',
  APPLE_GOLD: 'apple_gold',
} as const;

export const SNAKE_SKINS = {
  GREEN: 'green',
  BLUE: 'blue',
  YELLOW: 'yellow',
  RAINBOW: 'rainbow',
} as const;

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skin_green',
    name: 'Green Snake',
    description: 'Classic green snake skin',
    price: 0,
    type: 'skin',
    effect: () => { /* Change snake skin to green */ },
    icon: '/games/snake/sprites/snake_green_head_64.png',
  },
  {
    id: 'skin_yellow',
    name: 'Yellow Snake',
    description: 'Bright yellow snake skin',
    price: 100,
    type: 'skin',
    effect: () => { /* Change snake skin to yellow */ },
    icon: '/games/snake/sprites/snake_yellow_head_64.png',
  },
  {
    id: 'theme_dark',
    name: 'Dark Theme',
    description: 'Dark color scheme',
    price: 200,
    type: 'theme',
    effect: () => { /* Change to dark theme */ },
    icon: '/games/snake/sprites/wall_block_64_0.png',
  },
  {
    id: 'powerup_slowmo',
    name: 'Slow Motion',
    description: 'Slow down time for 10 seconds',
    price: 150,
    type: 'powerup',
    effect: () => { /* Activate slow motion */ },
    icon: '/games/snake/sprites/bomb_64.png',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Score your first point',
    condition: (state) => state.score >= 1,
    reward: 50,
    icon: '/games/snake/sprites/apple_red_32.png',
    unlocked: false,
  },
  {
    id: 'snake_charmer',
    name: 'Snake Charmer',
    description: 'Reach 100 points',
    condition: (state) => state.score >= 100,
    reward: 100,
    icon: '/games/snake/sprites/snake_green_eyes_32.png',
    unlocked: false,
  },
  {
    id: 'fruit_ninja',
    name: 'Fruit Ninja',
    description: 'Eat 50 fruits',
    condition: (state) => state.linesCleared >= 50,
    reward: 75,
    icon: '/games/snake/sprites/apple_green_32.png',
    unlocked: false,
  },
  {
    id: 'wall_crawler',
    name: 'Wall Crawler',
    description: 'Survive for 5 minutes',
    condition: (state) => state.level >= 5,
    reward: 150,
    icon: '/games/snake/sprites/wall_block_32_0.png',
    unlocked: false,
  },
];

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    speed: 180,           // Slower speed for beginners
    linesNeeded: 5,       // 5 foods to advance
    hasObstacles: false,  // No obstacles in first level
    obstacleCount: 0,     // No obstacles
    timeLimit: undefined, // No time limit
    description: 'Learn the basics - Collect 5 apples to advance',
    foodValue: 10,        // Standard points per food
    speedIncrement: 0,    // No speed increase
    allowWallPass: true   // Can pass through walls
  },
  {
    level: 2,
    speed: 150,           // Slightly faster
    linesNeeded: 8,       // 8 foods to advance
    hasObstacles: true,   // Add obstacles
    obstacleCount: 5,     // 5 obstacles
    timeLimit: 120,       // 2 minutes to complete
    description: 'Watch out for walls! - Collect 8 apples in 2 minutes',
    foodValue: 15,        // Slightly more points
    speedIncrement: 0.02, // Slight speed increase per food
    allowWallPass: false  // Cannot pass through walls
  },
  {
    level: 3,
    speed: 120,           // Even faster
    linesNeeded: 12,      // 12 foods to advance
    hasObstacles: true,   // More obstacles
    obstacleCount: 10,    // 10 obstacles
    timeLimit: 150,       // 2.5 minutes to complete
    description: 'Speed challenge! - Collect 12 apples quickly',
    foodValue: 20,        // More points per food
    speedIncrement: 0.03, // Noticeable speed increase
    allowWallPass: false  // Cannot pass through walls
  },
  // Keeping higher levels simpler for now
  { 
    level: 4, 
    speed: 90, 
    linesNeeded: 20,
    hasObstacles: true,
    obstacleCount: 15,
    description: 'Expert mode - No time limit',
    foodValue: 25,
    speedIncrement: 0.04,
    allowWallPass: false
  },
  { 
    level: 5, 
    speed: 70, 
    linesNeeded: 30,
    hasObstacles: true,
    obstacleCount: 20,
    description: 'Master level - Extreme challenge',
    foodValue: 30,
    speedIncrement: 0.05,
    allowWallPass: false
  },
  { 
    level: 6, 
    speed: 50, 
    linesNeeded: 50,
    hasObstacles: true,
    obstacleCount: 25,
    description: 'Impossible mode - For the truly skilled',
    foodValue: 50,
    speedIncrement: 0.1,
    allowWallPass: false
  },
];
