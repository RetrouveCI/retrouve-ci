/**
 * Base URL of the NestJS API. Override via EXPO_PUBLIC_API_URL — on a physical
 * device this must be the machine's LAN IP (or a tunnel), not localhost.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002';
