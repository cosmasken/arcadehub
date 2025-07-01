export interface Developer {
  id: string;
  wallet_address: string;
  username: string;
  bio: string;
  avatar?: string;
  name?: string;
  games?: number;
  downloads?: number;
  rating?: number;
  featured?: boolean;
}

export interface GameFormData {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  assets: File | null;
}