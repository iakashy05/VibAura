import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      },

      updateUser: (user) => set({ user, isSubscribed: user?.isSubscribed ?? false }),

      setSubscribed: (isSubscribed) => set({ isSubscribed }),
    }),
    {
      name: 'vibaura-auth', // name of the item in storage (default: localStorage)
    }
  )
);
