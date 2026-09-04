export type RateLimitBucket = 'otp' | 'auth' | 'public-write'

export interface RateLimitRule {
	bucket: RateLimitBucket
	max: number
	windowSeconds: number
}

const MINUTE = 60
const HOUR = 60 * MINUTE

/**
 * Each OTP spends an SMS, so this bucket guards a budget. It also bounds
 * guessing: better-auth allows three attempts per issued code, so capping the
 * codes caps the total.
 */
const OTP: RateLimitRule = { bucket: 'otp', max: 5, windowSeconds: 15 * MINUTE }
const AUTH: RateLimitRule = {
	bucket: 'auth',
	max: 10,
	windowSeconds: 15 * MINUTE,
}
const PUBLIC_WRITE: RateLimitRule = {
	bucket: 'public-write',
	max: 10,
	windowSeconds: HOUR,
}

const AUTH_PREFIXES = ['/api/auth/', '/api/admin-auth/']

/** The two better-auth routes that send a message rather than read a session. */
const OTP_PATHS = [
	'/api/auth/phone-number/send-otp',
	'/api/auth/phone-number/request-password-reset',
]

/** The three writes anyone may make without an account, matched by shape. */
const PUBLIC_WRITE_PATHS = [
	/^\/contact-messages$/,
	/^\/qr-codes\/[^/]+\/contact$/,
	/^\/lost-items\/[^/]+\/contact$/,
]

function pathOf(url: string): string {
	const path = url.split('?')[0] ?? url
	return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

/**
 * A read is never limited: `get-session` runs on every navigation of both
 * front-ends, so a cap there signs everyone out rather than slowing an attacker.
 */
export function limitFor(method: string, url: string): RateLimitRule | null {
	if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null

	const path = pathOf(url)

	if (OTP_PATHS.includes(path)) return OTP
	if (AUTH_PREFIXES.some(prefix => path.startsWith(prefix))) return AUTH
	if (PUBLIC_WRITE_PATHS.some(shape => shape.test(path))) return PUBLIC_WRITE

	return null
}
