export interface Achievement {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  rarity: string;
  game: string;
  unlocked?: boolean;
  unlocked_at?: string;
}
