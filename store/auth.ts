'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      login: (user) => set({ isAuthenticated: true, user, error: null }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateUser: (user) => set({ user, isAuthenticated: true }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user 
      }),
    }
  )
);

export default useAuthStore; 