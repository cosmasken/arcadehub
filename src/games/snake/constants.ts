import { ShopItem, Achievement } from './types';

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

export const LEVELS = [
  { level: 1, speed: 150, linesNeeded: 0 },
  { level: 2, speed: 130, linesNeeded: 10 },
  { level: 3, speed: 110, linesNeeded: 25 },
  { level: 4, speed: 90, linesNeeded: 50 },
  { level: 5, speed: 70, linesNeeded: 100 },
  { level: 6, speed: 50, linesNeeded: 200 },
];
