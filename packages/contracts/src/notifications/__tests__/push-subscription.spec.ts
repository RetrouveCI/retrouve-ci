import { describe, expect, it } from 'vitest'
import {
	PUSH_AUTH_BYTES,
	PUSH_AUTH_LENGTH,
	PUSH_ENDPOINT_MAX_LENGTH,
	PUSH_P256DH_BYTES,
	PUSH_P256DH_LENGTH,
	pushSubscriptionSchema,
	pushUnsubscribeSchema,
} from '../push-subscription.schema'

const p256dh = 'a'.repeat(PUSH_P256DH_LENGTH)
const auth = 'b'.repeat(PUSH_AUTH_LENGTH)

const subscription = (over: Record<string, unknown> = {}) => ({
	endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
	keys: { p256dh, auth },
	...over,
})

describe('the push subscription a browser hands over', () => {
	// ⚠️ Literals: every other case derives from these, so a wrong one stays green.
	it('pins the encoded lengths the browser actually produces', () => {
		expect([PUSH_P256DH_BYTES, PUSH_AUTH_BYTES]).toEqual([65, 16])
		expect([PUSH_P256DH_LENGTH, PUSH_AUTH_LENGTH]).toEqual([87, 22])
	})

	it('accepts what `PushSubscription.toJSON()` produces', () => {
		expect(pushSubscriptionSchema.safeParse(subscription()).success).toBe(true)
	})

	// Vendors send it, no vendor populates it, and an expiry the server trusted
	// would drop a subscription that still works.
	it('strips the expirationTime the browser adds', () => {
		const parsed = pushSubscriptionSchema.parse(
			subscription({ expirationTime: null }),
		)

		expect(parsed).not.toHaveProperty('expirationTime')
	})

	it.each([
		['http://fcm.googleapis.com/x', 'plain http'],
		['ftp://fcm.googleapis.com/x', 'another scheme'],
		['/fcm/send/abc', 'a relative path'],
	])('refuses %s (%s)', endpoint => {
		expect(
			pushSubscriptionSchema.safeParse(subscription({ endpoint })).success,
		).toBe(false)
	})

	it('refuses an endpoint past the ceiling', () => {
		const endpoint = `https://x.example/${'a'.repeat(PUSH_ENDPOINT_MAX_LENGTH)}`

		expect(
			pushSubscriptionSchema.safeParse(subscription({ endpoint })).success,
		).toBe(false)
	})

	// Both are base64url of a fixed-size value, so a wrong length is a wrong
	// key — and bounding them keeps a row from carrying anything but a key.
	it.each([
		[{ p256dh: 'a'.repeat(PUSH_P256DH_LENGTH - 1), auth }, 'a short p256dh'],
		[{ p256dh: 'a'.repeat(PUSH_P256DH_LENGTH + 1), auth }, 'a long p256dh'],
		[{ p256dh, auth: 'b'.repeat(PUSH_AUTH_LENGTH - 1) }, 'a short auth'],
		[{ p256dh: `${'a'.repeat(PUSH_P256DH_LENGTH - 1)}+`, auth }, 'base64 + '],
		[{ p256dh, auth: `${'b'.repeat(PUSH_AUTH_LENGTH - 1)}/` }, 'base64 /'],
	])('refuses %s', keys => {
		expect(
			pushSubscriptionSchema.safeParse(subscription({ keys })).success,
		).toBe(false)
	})

	it('refuses a subscription with no keys at all', () => {
		expect(
			pushSubscriptionSchema.safeParse({ endpoint: 'https://x.example/a' })
				.success,
		).toBe(false)
	})

	// The pipe answers the message the schema names, so every one must be French
	// or a visitor reads Zod's own English.
	const malformed: [unknown, string][] = [
		[{ keys: { p256dh, auth } }, 'endpoint missing'],
		[subscription({ endpoint: 42 }), 'endpoint not a string'],
		[subscription({ keys: { p256dh: 1, auth } }), 'a key not a string'],
		[subscription({ keys: {} }), 'both keys missing'],
	]

	it.each(malformed)('answers in French for %s', body => {
		const result = pushSubscriptionSchema.safeParse(body)

		expect(result.success).toBe(false)
		for (const issue of result.error?.issues ?? []) {
			expect(issue.message).not.toMatch(/[Ee]xpected|[Ii]nvalid input|required/)
		}
	})

	it('keeps only the endpoint when unsubscribing', () => {
		expect(pushUnsubscribeSchema.parse(subscription())).toEqual({
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
		})
	})
})
