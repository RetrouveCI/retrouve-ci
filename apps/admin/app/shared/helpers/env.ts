/**
 * Runtime configuration, deliberately **not** `import.meta.env`: Vite inlines
 * `VITE_*` at build time, which froze the API address into the image — and an
 * image built without it did not even boot, better-auth rejecting a
 * protocol-less `baseURL`. One image has to serve every environment, so the
 * value is read from the process on the server and handed to the browser by the
 * root loader (see `root.tsx`).
 */

const DEFAULT_PUBLIC_APP_URL = 'https://retrouveci.com'

export interface PublicEnv {
	API_URL: string
	PUBLIC_APP_URL: string
}

declare global {
	interface Window {
		ENV?: PublicEnv
	}
}

function fromProcess(name: string): string | undefined {
	return globalThis.process?.env?.[name]
}

/**
 * Throws on the server when unset rather than letting better-auth fail later on
 * a protocol-less URL: a backoffice that cannot reach its API is not worth
 * starting, and the previous symptom was an `ERR_INVALID_URL` on boot.
 */
export function apiUrl(): string {
	if (typeof window !== 'undefined') {
		return window.ENV?.API_URL ?? ''
	}

	const url = fromProcess('API_URL')

	if (!url) {
		throw new Error(
			'API_URL is required: the backoffice cannot reach the API without it.',
		)
	}

	return url
}

/**
 * The **public app's** origin, not the API's — it is what a scanned QR code
 * resolves to. It used to be derived from the API URL by replacing `:3002` with
 * `:3000`, which only ever worked on a developer's machine.
 */
export function publicAppUrl(): string {
	if (typeof window !== 'undefined') {
		return window.ENV?.PUBLIC_APP_URL ?? DEFAULT_PUBLIC_APP_URL
	}

	return fromProcess('PUBLIC_APP_URL') ?? DEFAULT_PUBLIC_APP_URL
}

/** What the root loader hands to the browser. Never put a secret in here. */
export function publicEnv(): PublicEnv {
	return { API_URL: apiUrl(), PUBLIC_APP_URL: publicAppUrl() }
}
