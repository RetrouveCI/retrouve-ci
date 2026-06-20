export interface User {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl?: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type TabKey = 'accueil' | 'annonces' | 'compte';
export type OverlayKey = 'scan' | 'auth' | 'order' | null;
export type AccountSection = 'annonces' | 'stickers' | 'commandes' | 'params';

export interface ToastState {
  message: string;
  icon?: string;
}
