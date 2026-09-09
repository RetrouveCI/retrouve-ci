const SERVICE_WORKER_PATH = '/sw.js'

/**
 * `updateViaCache: 'none'` plus the `update()` call are the update strategy: a
 * worker never re-fetched is a worker that serves one build for ever (§ R24).
 * Registered from the app because this app reveals no `entry.client.tsx`.
 */
export function registerServiceWorker(): void {
	if (typeof navigator === 'undefined') return
	if (!('serviceWorker' in navigator)) return

	void navigator.serviceWorker
		.register(SERVICE_WORKER_PATH, { updateViaCache: 'none' })
		.then(registration => registration.update())
		.catch(() => undefined)
}
