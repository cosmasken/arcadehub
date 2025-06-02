
import { items, Item } from './items';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseCost: number;
  clickMultiplier: number;
  passiveIncome: number;
}

// Convert the items object to shopItems format
export const shopItems: ShopItem[] = Object.entries(items).map(([id, item]: [string, Item]) => ({
  id,
  name: item.name,
  emoji: item.emoji || "🍯",
  description: item.description,
  baseCost: item.cost,
  clickMultiplier: item.multiplier,
  passiveIncome: item.perSecond
}));
