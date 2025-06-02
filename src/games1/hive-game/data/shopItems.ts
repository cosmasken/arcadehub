
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  baseCost: number;
  clickMultiplier: number;
  passiveIncome: number;
}

export const shopItems: ShopItem[] = [
  {
    id: 'worker_bee',
    name: 'Worker Bee',
    description: 'A hardworking bee that helps you collect honey automatically.',
    emoji: '🐝',
    baseCost: 10,
    clickMultiplier: 0,
    passiveIncome: 0.5
  },
  {
    id: 'honey_spoon',
    name: 'Honey Spoon',
    description: 'A golden spoon that doubles your clicking efficiency.',
    emoji: '🥄',
    baseCost: 25,
    clickMultiplier: 1,
    passiveIncome: 0
  },
  {
    id: 'flower_garden',
    name: 'Flower Garden',
    description: 'Beautiful flowers that attract more bees to your hive.',
    emoji: '🌻',
    baseCost: 100,
    clickMultiplier: 0,
    passiveIncome: 2
  },
  {
    id: 'bee_hive',
    name: 'Bee Hive',
    description: 'A proper home for your bees, greatly increasing honey production.',
    emoji: '🏠',
    baseCost: 500,
    clickMultiplier: 2,
    passiveIncome: 5
  },
  {
    id: 'queen_bee',
    name: 'Queen Bee',
    description: 'The royal bee that commands the entire hive and multiplies all production.',
    emoji: '👑',
    baseCost: 2000,
    clickMultiplier: 5,
    passiveIncome: 10
  },
  {
    id: 'honey_factory',
    name: 'Honey Factory',
    description: 'Industrial-scale honey production with automated systems.',
    emoji: '🏭',
    baseCost: 10000,
    clickMultiplier: 10,
    passiveIncome: 50
  }
];
