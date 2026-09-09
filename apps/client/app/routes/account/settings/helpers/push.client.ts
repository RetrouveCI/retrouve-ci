import { vapidPublicKey } from '@/shared/helpers/env'

/** What a row stores, flat because a form posts flat fields. */
export interface PushRegistration {
	endpoint: string
	p256dh: string
	auth: string
}

/** Why the switch cannot be offered, so the row says which rather than hiding. */
export type PushUnavailable =
	'unsupported' | 'unconfigured' | 'denied' | 'dismissed'

// `applicationServerKey` wants the raw bytes, and VAPID keys travel as
// base64url — which `atob` does not accept.
export function decodeVapidKey(key: string): Uint8Array<ArrayBuffer> {
	const padded = key.padEnd(key.length + ((4 - (key.length % 4)) % 4), '=')
	const binary = atob(padded.replaceAll('-', '+').replaceAll('_', '/'))
	// Over an explicit ArrayBuffer: `applicationServerKey` refuses a view whose
	// buffer could be a SharedArrayBuffer, which `Uint8Array.from` allows.
	const bytes = new Uint8Array(new ArrayBuffer(binary.length))

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index)
	}

	return bytes
}

// The two keys come back as ArrayBuffers, and the API stores their base64url.
function encodeKey(buffer: ArrayBuffer | null): string {
	if (!buffer) return ''

	const binary = String.fromCharCode(...new Uint8Array(buffer))

	return btoa(binary)
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replace(/=+$/, '')
}

export function toRegistration(
	subscription: PushSubscription,
): PushRegistration {
	return {
		endpoint: subscription.endpoint,
		p256dh: encodeKey(subscription.getKey('p256dh')),
		auth: encodeKey(subscription.getKey('auth')),
	}
}

export function pushUnavailable(): PushUnavailable | null {
	if (
		typeof navigator === 'undefined' ||
		!('serviceWorker' in navigator) ||
		typeof PushManager === 'undefined' ||
		typeof Notification === 'undefined'
	) {
		return 'unsupported'
	}

	if (!vapidPublicKey()) return 'unconfigured'
	if (Notification.permission === 'denied') return 'denied'

	return null
}

/** The subscription this browser already holds, if any. */
export async function currentRegistration(): Promise<PushRegistration | null> {
	if (pushUnavailable() === 'unsupported') return null

	const registration = await navigator.serviceWorker.ready
	const subscription = await registration.pushManager.getSubscription()

	return subscription ? toRegistration(subscription) : null
}

// `userVisibleOnly` is not a choice: Chrome refuses a silent subscription. A
// refused prompt is an outcome, not a fault, so it answers rather than throws.
export async function subscribe(): Promise<PushRegistration | PushUnavailable> {
	const unavailable = pushUnavailable()
	if (unavailable) return unavailable

	const permission = await Notification.requestPermission()
	if (permission !== 'granted') {
		return permission === 'denied' ? 'denied' : 'dismissed'
	}

	const registration = await navigator.serviceWorker.ready
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: decodeVapidKey(vapidPublicKey()),
	})

	return toRegistration(subscription)
}

// Answers the endpoint so the caller can tell the API which row to forget —
// even when `unsubscribe()` reports false: it stopped being ours either way.
export async function unsubscribe(): Promise<string | null> {
	if (pushUnavailable() === 'unsupported') return null

	const registration = await navigator.serviceWorker.ready
	const subscription = await registration.pushManager.getSubscription()

	if (!subscription) return null

	const { endpoint } = subscription
	await subscription.unsubscribe()

	return endpoint
}
