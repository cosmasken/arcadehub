// hooks/use-supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // Generate types with supabase cli

let supabase: SupabaseClient<Database> | null = null;

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

// Helper functions
export const getUserByWallet = async (walletAddress: string) => {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();
  
  if (error && error.code !== 'PGRST116') { // Ignore "not found" error
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

// Add more helper functions as needed