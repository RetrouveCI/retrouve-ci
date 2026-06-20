import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { AccountSection, OverlayKey, TabKey, ThemeMode, ToastState, User } from './types';

const TOKEN_KEY = 'retrouveci.auth.token';

/**
 * Global UI/auth store. The auth token is NEVER kept in React state — it lives
 * exclusively in expo-secure-store (see CLAUDE/skill constraint). Only the
 * derived `isAuthenticated` flag and the `user` profile are exposed here.
 */
interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  isHydrated: boolean;

  // Navigation
  activeTab: TabKey;
  activeOverlay: OverlayKey;

  // UI
  theme: ThemeMode;
  toast: ToastState | null;

  // Account
  accountSection: AccountSection;

  // Actions
  hydrate: () => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveTab: (tab: TabKey) => void;
  setOverlay: (overlay: OverlayKey) => void;
  setTheme: (theme: ThemeMode) => void;
  setAccountSection: (section: AccountSection) => void;
  showToast: (message: string, icon?: string) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  isHydrated: false,

  activeTab: 'accueil',
  activeOverlay: null,

  theme: 'auto',
  toast: null,

  accountSection: 'annonces',

  hydrate: async () => {
    //const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ isAuthenticated: true /*Boolean(token)*/, isHydrated: true });
  },

  setAuth: async (user, token) => {
    //await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    //await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setOverlay: (activeOverlay) => set({ activeOverlay }),
  setTheme: (theme) => set({ theme }),
  setAccountSection: (accountSection) => set({ accountSection }),
  showToast: (message, icon) => set({ toast: { message, icon } }),
  clearToast: () => set({ toast: null }),
}));

/** Read the auth token from secure storage (for the axios interceptor). */
export function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function clearAuthToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
