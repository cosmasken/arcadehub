import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

let supabase: SupabaseClient<Database> | null = null;

// Initialize Supabase client
export const getSupabase = () => {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabase;
};

// ========== Users ==========
export const getUserByWallet = async (walletAddress: string) => {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
    throw error;
  }
  
  return data;
};

export const createUser = async (walletAddress: string, userData?: Partial<Database['public']['Tables']['users']['Insert']>) => {
  const { data, error } = await getSupabase()
    .from('users')
    .insert([{ 
      wallet_address: walletAddress.toLowerCase(),
      ...userData 
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
};

export const updateUser = async (walletAddress: string, updates: Partial<Database['public']['Tables']['users']['Update']>) => {
  const { data, error } = await getSupabase()
    .from('users')
    .update(updates)
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  
  return data;
};

// ========== Games ==========
export const getGames = async (filters: {
  category?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
}) => {
  let query = getSupabase()
    .from('games')
    .select('*')
    .order('name');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching games:', error);
    throw error;
  }

  return data;
};

// ========== Tournaments ==========
export const getTournaments = async (filters: {
  status?: 'upcoming' | 'live' | 'completed' | 'cancelled';
  gameId?: number;
  sponsorId?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = getSupabase()
    .from('tournaments')
    .select(`
      *,
      game:games(*),
      sponsor:users(*)
    `)
    .order('start_time', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.gameId) {
    query = query.eq('game_id', filters.gameId);
  }
  if (filters.sponsorId) {
    query = query.eq('sponsor_id', filters.sponsorId);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }

  return data;
};

export const getTournamentById = async (id: number) => {
  const { data, error } = await getSupabase()
    .from('tournaments')
    .select(`
      *,
      game:games(*),
      sponsor:users(*),
      participants:tournament_participants(
        user:users(*),
        score,
        rank
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }

  return data;
};

export const createTournament = async (tournamentData: Database['public']['Tables']['tournaments']['Insert']) => {
  const { data, error } = await getSupabase()
    .from('tournaments')
    .insert([tournamentData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
  
  return data;
};

// ========== Tournament Participants ==========
export const joinTournament = async (tournamentId: number, userId: string) => {
  const { data, error } = await getSupabase()
    .from('tournament_participants')
    .insert([{
      tournament_id: tournamentId,
      user_id: userId,
      score: 0
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error joining tournament:', error);
    throw error;
  }
  
  return data;
};

export const updateParticipantScore = async (tournamentId: number, userId: string, score: number) => {
  const { data, error } = await getSupabase()
    .from('tournament_participants')
    .update({ score })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating participant score:', error);
    throw error;
  }
  
  return data;
};

// ========== User Stats ==========
export const getUserStats = async (userId: string) => {
  const { data, error } = await getSupabase()
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user stats:', error);
    throw error;
  }

  return data || {
    user_id: userId,
    total_tournaments: 0,
    tournaments_won: 0,
    total_prizes: 0,
    win_rate: 0
  };
};

// ========== Real-time Subscriptions ==========
export const subscribeToTournamentUpdates = (tournamentId: number, callback: (payload: any) => void) => {
  const subscription = getSupabase()
    .channel(`tournament_${tournamentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_participants',
        filter: `tournament_id=eq.${tournamentId}`
      },
      callback
    )
    .subscribe();

  return () => {
    getSupabase().removeChannel(subscription);
  };
};

// ========== Storage ==========
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await getSupabase()
    .storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = getSupabase()
    .storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// ========== RPC Functions ==========
export const updateTournamentRankings = async (tournamentId: number) => {
  const { data, error } = await getSupabase()
    .rpc('update_tournament_rankings', { tournament_id: tournamentId });

  if (error) {
    console.error('Error updating tournament rankings:', error);
    throw error;
  }

  return data;
};

// Export the supabase client for direct access when needed
export { supabase };