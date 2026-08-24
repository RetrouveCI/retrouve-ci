/**
 * Runtime configuration, deliberately **not** `import.meta.env`: Vite inlines
 * `VITE_*` at build time, which froze the API address into the image. One image
 * has to serve every environment, so the value is read from the process on the
 * server and handed to the browser by the root loader (see `root.tsx`).
 */

export interface PublicEnv {
	API_URL: string
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
 * a protocol-less URL: a front that cannot reach its API is not worth starting,
 * and the previous symptom was an `ERR_INVALID_URL` stack trace on boot.
 */
export function apiUrl(): string {
	if (typeof window !== 'undefined') {
		return window.ENV?.API_URL ?? ''
	}

	const url = fromProcess('API_URL')

	if (!url) {
		throw new Error(
			'API_URL is required: the app cannot reach the API without it.',
		)
	}

	return url
}

/** What the root loader hands to the browser. Never put a secret in here. */
export function publicEnv(): PublicEnv {
	return { API_URL: apiUrl() }
}
