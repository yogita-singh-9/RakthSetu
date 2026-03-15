import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isLoggedIn: !!user 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isLoggedIn: false 
      }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user 
          ? { 
              ...state.user, 
              ...userData,
              appointments: userData.appointments || state.user.appointments || [],
              isBloodDonor: userData.isBloodDonor ?? state.user.isBloodDonor ?? false,
              lastDonationDate: userData.lastDonationDate ?? state.user.lastDonationDate ?? null
            } 
          : {
              ...userData,
              appointments: userData.appointments || [],
              isBloodDonor: userData.isBloodDonor ?? false,
              lastDonationDate: userData.lastDonationDate ?? null
            }
      }))
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
