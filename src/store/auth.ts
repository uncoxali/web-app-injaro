import { create } from "zustand";
import { cookieUtils } from "@/lib/cookies";

export interface User {
  id: string;
  phone: string;
  full_name?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  phoneNumber: string | null;
  isNewUser: boolean;
  onboardingDone: boolean;
  setUser: (user: User | null) => void;
  setPhoneNumber: (phone: string | null) => void;
  setIsNewUser: (isNew: boolean) => void;
  setOnboardingDone: (done: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  phoneNumber: null,
  isNewUser: false,
  onboardingDone: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setIsNewUser: (isNew) => set({ isNewUser: isNew }),
  setOnboardingDone: (done) => set({ onboardingDone: done }),
  login: (user, accessToken, refreshToken) => {
    cookieUtils.setAccessToken(accessToken);
    cookieUtils.setRefreshToken(refreshToken);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      phoneNumber: null,
      isNewUser: false,
    });
  },
  logout: () => {
    cookieUtils.clearAll();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      phoneNumber: null,
      isNewUser: false,
      onboardingDone: false,
    });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
