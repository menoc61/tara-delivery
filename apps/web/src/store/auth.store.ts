import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, AuthTokens, UserRole } from "@tara/types";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  isRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),

      isRole: (role) => get().user?.role === role,
    }),
    {
      name: "tara-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
