/**
 * A BullMQ queue name is infrastructure, not business: it addresses a Redis
 * key, and both the producer and the consumer must spell it identically. The
 * two lived apart — one under `shared/auth/`, one inside
 * `domains/matching/` — which meant `presentations/` reached into a domain for
 * a Redis address.
 */
export const OTP_QUEUE = 'otp'
export const SEND_OTP_JOB = 'send-otp'

export const MATCHING_QUEUE = 'matching'
export const FIND_MATCHES_JOB = 'find-matches'

/**
 * A matching job holds no secret, so — unlike an OTP — its completed jobs are
 * worth keeping, bounded, and its failed ones long enough to be diagnosed.
 */
export const MATCHING_ATTEMPTS = 3
export const MATCHING_BACKOFF_DELAY_MS = 5_000
export const MATCHING_KEEP_COMPLETED = 100
export const MATCHING_KEEP_FAILED_SECONDS = 7 * 24 * 60 * 60
