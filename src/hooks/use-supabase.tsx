import { createClient, SupabaseClient, AuthClientOptions } from '@supabase/supabase-js';
import {
  User, Game, Tournament, TournamentParticipant,
  TournamentSponsor, UserStats, UserAchievement,
  UserRole, UserRoleAssignment, CreateUserRequest,
  UpdateUserRequest, CreateTournamentRequest,
  PaginatedResponse, WithRelations
} from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SupabaseAuthTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
let supabase: SupabaseClient;

// Initialize Supabase with authentication tokens
export const initSupabase = (tokens?: SupabaseAuthTokens) => {
  const { accessToken, refreshToken } = tokens || {};
  
  const options: AuthClientOptions = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key: string) => {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key);
        }
      }
    },
    global: {
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    }
  };

  // If we have a refresh token, set up the session
  if (refreshToken) {
    options.auth.autoRefreshToken = true;
    options.auth.refreshInterval = 300; // 5 minutes
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, options);

  // Set the session if we have tokens
  if (accessToken && refreshToken) {
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    }).catch(console.error);
  }

  return supabase;
};

// Initialize without token by default
initSupabase();

// Function to update the auth token
export const setAuthTokens = async (tokens: {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}) => {
  const { accessToken, refreshToken } = tokens;
  
  // Initialize with new tokens
  initSupabase({ accessToken, refreshToken });
  
  // Set the session with the new tokens
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error) {
    console.error('Error setting auth session:', error);
    throw error;
  }

  return data;
};

// Function to clear the auth token
export const clearAuth = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    initSupabase();
  } catch (error) {
    console.error('Error clearing auth:', error);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// ========== User Operations ==========
export const createUser = async (userData: CreateUserRequest): Promise<User | null> => {
  try {
    // Make sure we have a valid session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        user_type: userData.user_type || 'player',
        is_verified: false
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw error; // Re-throw to be caught by the caller
    }
    return data;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error; // Re-throw to be caught by the caller
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Make sure we have a valid session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error; // Re-throw to be caught by the caller
  }
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

export const updateUser = async (userId: string, updates: UpdateUserRequest): Promise<User | null> => {
  try {
    // Make sure we have a valid session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

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
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
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

  if (error) {
    console.error("Error checking username availability:", error);
    return false; // Assume not available on error
  }
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

export const useSupabase = () => {
  return {
    createUser,
    getUser,
    getUserByWallet,
    updateUser,
    getUserRoles,
    assignUserRole,
    createTournament,
    getTournament,
    joinTournament,
    updateParticipantScore,
    addTournamentSponsor,
    getUserStats,
    getUserAchievements,
    checkUsernameAvailability,
    uploadFile,
  };
};

export default supabase;
