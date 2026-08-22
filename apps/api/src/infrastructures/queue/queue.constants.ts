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
