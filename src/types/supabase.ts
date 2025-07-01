export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ========== Base Types ==========
export type UserRole = 'player' | 'developer' | 'sponsor' | 'admin';
export type TournamentStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

// ========== Database Enums ==========
export const UserRoles = {
  PLAYER: 'player',
  DEVELOPER: 'developer',
  SPONSOR: 'sponsor',
  ADMIN: 'admin',
} as const;

export const TournamentStatuses = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// ========== Core Entity Types ==========
export interface User {
  id: string;
  wallet_address: string;
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  user_type: UserRole;
  company_name?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  is_verified: boolean;
  verification_data?: Json | null;
  industry?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  onchain_id?: number | null;
  onchain_tx_hash?: string | null;
  onchain_status?: string | null;
}

export interface Game {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  contract_address?: string | null;
  category?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tournament {
  id: number;
  title: string;
  description?: string | null;
  game_id: number;
  sponsor_id?: string | null;
  prize_pool: number;
  entry_fee: number;
  max_participants?: number | null;
  start_time: string;
  end_time?: string | null;
  status: TournamentStatus;
  rules?: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  onchain_id?: number | null;
  onchain_tx_hash?: string | null;
  onchain_status?: string | null;
  game?: Game;
  sponsor?: User;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  user_id: string;
  score: number;
  rank?: number | null;
  joined_at: string;
  onchain_tx_hash?: string | null;
  user?: User;
  tournament?: Tournament;
}

export interface TournamentSponsor {
  id: number;
  tournament_id: number;
  sponsor_id: string;
  token_address?: string | null;
  token_amount?: number | null;
  created_at: string;
  sponsor?: User;
  tournament?: Tournament;
}

export interface UserStats {
  user_id: string;
  total_tournaments: number;
  tournaments_won: number;
  total_prizes: number;
  win_rate: number;
  updated_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  earned_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  permissions: Record<string, Json>;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: number;
  created_at: string;
  role?: Role;
}

// ========== Request/Response Types ==========
export interface CreateUserRequest {
  wallet_address: string;
  username: string;
  email?: string;
  avatar_url?: string;
  user_type?: UserRole;
  company_name?: string;
  website?: string;
  social_links?: Record<string, string>;
}

export interface UpdateUserRequest {
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  company_name?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
}

export interface CreateTournamentRequest {
  title: string;
  description?: string;
  game_id?: number;
  sponsor_id?: string;
  prize_pool: number;
  entry_fee?: number;
  max_participants?: number;
  start_time: string;
  end_time?: string;
  status?: TournamentStatus;
  rules?: string[];
  image_url?: string;
  onchain_id?: number;
  onchain_tx_hash?: string;
}

// ========== Utility Types ==========
export type WithRelations<T, K extends string> = T & {
  [P in K]: Json; // This will be properly typed when expanded in queries
};

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};