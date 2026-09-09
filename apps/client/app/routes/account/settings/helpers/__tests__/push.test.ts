import { pushSubscriptionSchema } from '@app/contracts/notifications'
import { decodeVapidKey, pushUnavailable, toRegistration } from '../push.client'

// A real VAPID public key: 65 bytes of P-256 point, so 87 base64url characters
// and no padding. The shape that broke a first draft using `atob` directly.
const VAPID =
	'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

describe('decoding a VAPID key', () => {
	it('answers the 65 bytes a P-256 point carries', () => {
		expect(decodeVapidKey(VAPID)).toHaveLength(65)
	})

	// `applicationServerKey` refuses a view whose buffer could be shared.
	it('sits on a plain ArrayBuffer', () => {
		expect(decodeVapidKey(VAPID).buffer).toBeInstanceOf(ArrayBuffer)
	})

	// base64url swaps two characters and drops the padding, so `atob` alone
	// throws on a real key.
	it('accepts the base64url alphabet and the missing padding', () => {
		expect(() => decodeVapidKey('a-b_cd')).not.toThrow()
	})

	it('starts with the uncompressed-point marker', () => {
		expect(decodeVapidKey(VAPID)[0]).toBe(4)
	})
})

describe('reading a subscription', () => {
	const bufferOf = (byte: number, length: number) =>
		new Uint8Array(length).fill(byte).buffer

	it('flattens the two keys into base64url', () => {
		const registration = toRegistration({
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
			getKey: (name: string) =>
				name === 'p256dh' ? bufferOf(4, 65) : bufferOf(7, 16),
		} as unknown as PushSubscription)

		expect(registration.endpoint).toBe(
			'https://fcm.googleapis.com/fcm/send/abc',
		)
		// The lengths the contract pins, which is what makes the row storable.
		expect(registration.p256dh).toHaveLength(87)
		expect(registration.auth).toHaveLength(22)
	})

	// ⚠️ The seam: each side's spec agreed with itself, not with the other.
	it('produces exactly what the contract accepts', () => {
		const registration = toRegistration({
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
			getKey: (name: string) =>
				name === 'p256dh' ? bufferOf(4, 65) : bufferOf(7, 16),
		} as unknown as PushSubscription)

		const parsed = pushSubscriptionSchema.safeParse({
			endpoint: registration.endpoint,
			keys: { p256dh: registration.p256dh, auth: registration.auth },
		})

		expect(parsed.error?.issues ?? []).toEqual([])
		expect(parsed.success).toBe(true)
	})

	it('answers an empty key rather than throwing when there is none', () => {
		const registration = toRegistration({
			endpoint: 'https://x.example/a',
			getKey: () => null,
		} as unknown as PushSubscription)

		expect(registration.p256dh).toBe('')
	})
})

// Node has no `PushManager`, which is the branch a desktop browser without push
// also takes — so the switch is offered nowhere it cannot work.
describe('whether push can be offered', () => {
	it('reports the device as unsupported where the API is absent', () => {
		expect(pushUnavailable()).toBe('unsupported')
	})
})
