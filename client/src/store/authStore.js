import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlayerStore } from './playerStore';
import { useLibraryStore } from './libraryStore';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isSubscribed: false,

      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isSubscribed: user?.isSubscribed ?? false 
      }),
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isSubscribed: false });
        // Clean reset of player and library states on logout
        try {
          usePlayerStore.getState().stop();
          useLibraryStore.getState().reset();
        } catch (err) {
          console.error('Error resetting stores during logout:', err);
        }
      },

      updateUser: (user) => set({ user, isSubscribed: user?.isSubscribed ?? false }),

      setSubscribed: (isSubscribed) => set({ isSubscribed }),
    }),
    {
      name: 'vibaura-auth', // name of the item in storage (default: localStorage)
    }
  )
);
