export interface DeveloperProfile {
  id: string;
  wallet_address: string;
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  user_type: string;
  company_name?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  is_verified: boolean;
  verification_data?: Record<string, unknown> | null;
  industry?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameProfile {
  game_id: number;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  downloads?: number;
  rating?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  developer_wallet?: string;
  is_active?: boolean;
  status?: 'draft' | 'published' | 'archived';
}