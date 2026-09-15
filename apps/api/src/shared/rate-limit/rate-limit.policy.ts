export type RateLimitBucket =
	| 'otp'
	| 'auth'
	| 'public-write'
	| 'public-read'
	| 'upload'
	| 'authenticated-write'
	| 'assistant'

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
export const OTP: RateLimitRule = {
	bucket: 'otp',
	max: 5,
	windowSeconds: 15 * MINUTE,
}
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

// Generous on purpose: a six-character code out of a 32-letter alphabet is
// already unsweepable, and carriers here put many visitors behind one address.
const PUBLIC_READ: RateLimitRule = {
	bucket: 'public-read',
	max: 60,
	windowSeconds: 15 * MINUTE,
}

// A photo is stored, transformed and served by Cloudinary, so an upload is the
// other route that spends money. Generous per address, since a carrier puts
// many visitors behind one: `UPLOAD_PER_USER` is the ceiling that counts.
const UPLOAD: RateLimitRule = {
	bucket: 'upload',
	max: 60,
	windowSeconds: HOUR,
}

// The search assistant is the one route that spends money on a model, and it is
// open to anonymous visitors, so the same numbers as `OTP` for the same reason:
// a bucket that guards a budget. Five phrases a quarter of an hour is well
// above one search intent, and `ASSISTANT_MONTHLY` is what bounds the bill.
const ASSISTANT: RateLimitRule = {
	bucket: 'assistant',
	max: 5,
	windowSeconds: 15 * MINUTE,
}

/**
 * A ceiling counted for the installation as a whole rather than per caller.
 * No message: reaching it is not a refusal a visitor reads, it is the repli —
 * the assistant stops answering and the filters stay open.
 */
export interface SpendLimit {
	keyPrefix: string
	max: number
}

// Keyed on the account rather than the address: it carries its own message and
// key prefix, so one service serves every such ceiling.
export interface AccountLimit {
	keyPrefix: string
	max: number
	windowSeconds: number
	message: string
}

/** Six listings' worth of photos an hour, retries and re-crops included. */
export const UPLOAD_PER_USER: AccountLimit = {
	keyPrefix: 'upload-user',
	max: 30,
	windowSeconds: HOUR,
	message:
		'Trop de photos envoyées pour ce compte. Merci de patienter avant de réessayer.',
}

// Publishing costs a row and not a bill, so what a flood spends is the
// moderation queue. Ten an hour is well above what a genuine poster files.
export const LOST_ITEM_PER_USER: AccountLimit = {
	keyPrefix: 'lost-item-user',
	max: 10,
	windowSeconds: HOUR,
	message:
		'Trop d’annonces publiées depuis ce compte. Merci de patienter avant d’en publier une autre.',
}

// A reply costs a row and a desk notification, so what a flood spends is the
// desk's attention. Its own ceiling: a conversation is not a publication.
export const LISTING_COMMENT_PER_USER: AccountLimit = {
	keyPrefix: 'listing-comment-user',
	max: 20,
	windowSeconds: HOUR,
	message:
		'Trop de messages envoyés depuis ce compte. Merci de patienter avant de répondre à nouveau.',
}

// The same numbers as `OTP`, keyed on the number. Both hold at once: an address
// is forwarded and rotatable, while a number is what an SMS costs money on.
export const OTP_PER_NUMBER = {
	max: OTP.max,
	windowSeconds: OTP.windowSeconds,
}

const AUTH_PREFIXES = ['/api/auth/', '/api/admin-auth/']

// The one password write mounted outside those prefixes, so the only one the
// prefix rule missed — and setting a password hashes it, which costs CPU.
const AUTH_PATHS = ['/account/set-initial-password']

/**
 * A ceiling on the **bill**, not on a caller: one counter for the whole
 * installation, reset with the calendar month so it lines up with the invoice.
 * 10 000 extractions is the 10 $/mois the plan settled on — measured at roughly
 * 0,001 $ the phrase on `claude-haiku-4-5`, a ~700-token invite and a ~60-token
 * answer, with no prompt cache to count on: Haiku 4.5 caches nothing below
 * 4096 tokens and this invite is far below that.
 */
export const ASSISTANT_MONTHLY: SpendLimit = {
	keyPrefix: 'assistant-month',
	max: 10_000,
}

/** The two better-auth routes that send a message rather than read a session. */
const OTP_PATHS = [
	'/api/auth/phone-number/send-otp',
	'/api/auth/phone-number/request-password-reset',
]

/** The three writes anyone may make without an account, matched by shape. */
const PUBLIC_WRITE_PATHS = [
	/^\/contact-messages$/,
	/^\/qr-codes\/[^/]+\/contact$/,
	/^\/qr-codes\/[^/]+\/reach$/,
	/^\/lost-items\/[^/]+\/contact$/,
]

/** One route, and the only one in the app that spends money on a model. */
const ASSISTANT_PATHS = ['/search-assistant/interpret']

/** Authenticated, so every request here already has an owner to charge. */
const UPLOAD_PATHS = [/^\/uploads\/[^/]+$/]

// Authenticated writes that commit something outside the database. Generous,
// because a carrier puts many accounts behind one address.
const AUTHENTICATED_WRITE: RateLimitRule = {
	bucket: 'authenticated-write',
	max: 60,
	windowSeconds: HOUR,
}

// A subscription is a row a caller could otherwise forge without end, one per
// invented endpoint — where a delete only reaches what they already hold.
const AUTHENTICATED_WRITE_PATHS = [
	/^\/sticker-orders$/,
	/^\/lost-items$/,
	/^\/lost-items\/[^/]+\/comments$/,
	/^\/notifications\/push$/,
]

/** An allowlist, so no future read — `get-session` above all — falls in by resembling one. */
const PUBLIC_READ_PATHS = [/^\/qr-codes\/[^/]+\/scan$/]

function pathOf(url: string): string {
	const path = url.split('?')[0] ?? url
	return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

/**
 * A read is limited only where `PUBLIC_READ_PATHS` names it: `get-session` runs
 * on every navigation, so a cap there signs everyone out. `OPTIONS` is never
 * capped, since a refused preflight breaks the call it precedes.
 */
export function limitFor(method: string, url: string): RateLimitRule | null {
	if (method === 'OPTIONS') return null

	const path = pathOf(url)

	if (method === 'GET' || method === 'HEAD') {
		return PUBLIC_READ_PATHS.some(shape => shape.test(path))
			? PUBLIC_READ
			: null
	}

	if (OTP_PATHS.includes(path)) return OTP
	if (ASSISTANT_PATHS.includes(path)) return ASSISTANT
	if (AUTH_PATHS.includes(path)) return AUTH
	if (AUTH_PREFIXES.some(prefix => path.startsWith(prefix))) return AUTH
	if (UPLOAD_PATHS.some(shape => shape.test(path))) return UPLOAD
	if (PUBLIC_WRITE_PATHS.some(shape => shape.test(path))) return PUBLIC_WRITE
	if (AUTHENTICATED_WRITE_PATHS.some(shape => shape.test(path))) {
		return AUTHENTICATED_WRITE
	}

	return null
}
