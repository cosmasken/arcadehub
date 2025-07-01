import { create } from 'zustand';
import { User } from '../types/supabase';
import { supabase } from '../lib/supabase';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  fetchUser: (userId: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  
  fetchUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      set({ user: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false 
      });
    }
  },
  
  clearUser: () => set({ user: null })
}));

export default useUserStore;
