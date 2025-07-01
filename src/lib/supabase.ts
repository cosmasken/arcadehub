import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Helper function to handle errors
export function handleError(error: unknown, defaultMessage = 'An error occurred') {
  if (error instanceof Error) {
    console.error(error);
    return error.message;
  }
  return defaultMessage;
}

// Realtime subscriptions
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// Storage helpers
export const storage = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },
  
  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};

// Database helpers
export const db = {
  async insert(table: string, values: any) {
    const { data, error } = await supabase
      .from(table)
      .insert(values)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  async update(table: string, values: any, match: any) {
    const { data, error } = await supabase
      .from(table)
      .update(values)
      .match(match)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  async remove(table: string, match: any) {
    const { error } = await supabase
      .from(table)
      .delete()
      .match(match);
    
    if (error) throw error;
    return true;
  }
};
