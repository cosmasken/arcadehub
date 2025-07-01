import { createClient } from '@supabase/supabase-js';
import { 
  User, Game, Tournament, TournamentParticipant, 
  TournamentSponsor, UserStats, UserAchievement,
  UserRole, UserRoleAssignment, CreateUserRequest, 
  UpdateUserRequest, CreateTournamentRequest, 
  PaginatedResponse, WithRelations
} from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== User Operations ==========
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      user_type: userData.user_type || 'player',
      is_verified: false
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserByWallet = async (walletAddress: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, updates: UpdateUserRequest): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ========== Role Operations ==========
export const getUserRoles = async (userId: string): Promise<UserRoleAssignment[]> => {
  const { data, error } = await supabase
    .from('user_role_assignments')
    .select(`
      *,
      role:user_roles(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const assignUserRole = async (userId: string, roleId: number): Promise<UserRoleAssignment> => {
  const { data, error } = await supabase
    .from('user_role_assignments')
    .insert([{ user_id: userId, role_id: roleId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ========== Tournament Operations ==========
export const createTournament = async (tournamentData: CreateTournamentRequest): Promise<Tournament> => {
  const { data, error } = await supabase
    .from('tournaments')
    .insert([{
      ...tournamentData,
      status: tournamentData.status || 'upcoming',
      entry_fee: tournamentData.entry_fee || 0
    }])
    .select(`
      *,
      game:games(*),
      sponsor:users(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getTournament = async (tournamentId: number): Promise<Tournament | null> => {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      game:games(*),
      sponsor:users(*)
    `)
    .eq('id', tournamentId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const joinTournament = async (
  tournamentId: number, 
  userId: string, 
  onchainTxHash?: string
): Promise<TournamentParticipant> => {
  const { data, error } = await supabase
    .from('tournament_participants')
    .insert([{ 
      tournament_id: tournamentId, 
      user_id: userId,
      onchain_tx_hash: onchainTxHash,
      score: 0
    }])
    .select(`
      *,
      user:users(*),
      tournament:tournaments(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateParticipantScore = async (
  tournamentId: number, 
  userId: string, 
  score: number
): Promise<TournamentParticipant> => {
  const { data, error } = await supabase
    .from('tournament_participants')
    .update({ score })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .select(`
      *,
      user:users(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

// ========== Sponsor Operations ==========
export const addTournamentSponsor = async (
  tournamentId: number, 
  sponsorId: string, 
  tokenAddress?: string, 
  tokenAmount?: number
): Promise<TournamentSponsor> => {
  const { data, error } = await supabase
    .from('tournament_sponsors')
    .insert([{
      tournament_id: tournamentId,
      sponsor_id: sponsorId,
      token_address: tokenAddress,
      token_amount: tokenAmount
    }])
    .select(`
      *,
      sponsor:users(*),
      tournament:tournaments(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

// ========== User Stats & Achievements ==========
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

// ========== Utility Functions ==========
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return !data; // Available if no user found
};

export const uploadFile = async (file: File, path: string): Promise<{ path: string }> => {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${path}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (error) throw error;
  
  return { 
    path: `${supabaseUrl}/storage/v1/object/public/public/${filePath}`
  };
};

export default supabase;