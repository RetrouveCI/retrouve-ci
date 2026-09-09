export const CLIENT_AUTH = Symbol('CLIENT_AUTH')
export const ADMIN_AUTH = Symbol('ADMIN_AUTH')

/** Optional: unset `REDIS_URL` outside production leaves the OTP budget uncounted. */
export const OTP_BUDGET_COUNTER = Symbol('OTP_BUDGET_COUNTER')
