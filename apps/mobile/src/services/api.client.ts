import axios, { type AxiosRequestConfig } from 'axios';

import { clearAuthToken, getAuthToken, useAppStore } from '@/store/app.store';

/**
 * Configured axios instance for the RetrouveCI NestJS API.
 * - baseURL from EXPO_PUBLIC_API_URL (falls back to localhost dev port 3002).
 * - injects the bearer token read from expo-secure-store on every request.
 * - on 401, clears the token and flips the store back to unauthenticated.
 */
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002',
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuthToken();
      useAppStore.setState({ isAuthenticated: false, user: null });
    }
    return Promise.reject(error);
  },
);

/**
 * Orval mutator: every generated SDK call routes through this function so it
 * shares the configured instance, token injection and 401 handling.
 */
export const apiClient = <T>(config: AxiosRequestConfig): Promise<T> =>
  api({ ...config }).then((r) => r.data);

export default apiClient;
