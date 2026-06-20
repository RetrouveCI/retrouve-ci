import { expoClient } from '@better-auth/expo/client';
import { phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from './config';

/**
 * Better-auth client for the mobile app — phone-number OTP, with the Expo
 * plugin persisting the session cookie in expo-secure-store and re-attaching it
 * to requests. `getCookie()` lets us forward that cookie to the NestJS REST
 * controllers (which are cookie-authenticated).
 *
 * NOTE: completing the phone OTP loop end-to-end also requires the API to trust
 * the app scheme as an origin (add better-auth's `expo()` server plugin +
 * `retrouveci://` to trustedOrigins) — a backend change.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    phoneNumberClient(),
    expoClient({
      scheme: 'retrouveci',
      storagePrefix: 'retrouveci',
      storage: SecureStore,
    }),
  ],
});

/** Local Ivorian number → E.164 (+225…), matching the web client. */
export function toE164(localNumber: string): string {
  return `+225${localNumber.replace(/\s/g, '')}`;
}
