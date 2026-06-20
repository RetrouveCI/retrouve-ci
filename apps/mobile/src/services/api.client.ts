import axios, { type AxiosRequestConfig } from 'axios';

import { authClient } from './auth-client';
import { API_BASE_URL } from './config';

export { API_BASE_URL };

/**
 * Configured axios instance for the RetrouveCI NestJS API.
 * - baseURL from EXPO_PUBLIC_API_URL (defaults to localhost:3002 for dev).
 * - forwards the better-auth session cookie (stored by @better-auth/expo) so the
 *   cookie-authenticated REST controllers accept the request.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // expoClient exposes the stored cookie string for non-better-auth requests.
  const cookie = authClient.getCookie();
  if (cookie) {
    config.headers = config.headers ?? {};
    config.headers.Cookie = cookie;
  }
  return config;
});

/**
 * Orval mutator: the generated SDK routes every call through this function so it
 * shares the configured instance and cookie forwarding. Orval may pass a second
 * options object (extra axios config), so accept and merge it.
 */
export const apiClient = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
  api({ ...config, ...options }).then((r) => r.data);

export default apiClient;
