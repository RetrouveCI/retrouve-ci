import { ApiError, toApiErrorMessage, type ApiErrorBody } from './api-error'

interface CreateApiFetchOptions {
	/**
	 * Where the API lives, resolved **per call** rather than when this module is
	 * first imported. It used to read `import.meta.env.VITE_API_URL`, which Vite
	 * inlines at build time — so the address of the API was frozen into the
	 * image, and an image built without it silently called its own origin.
	 */
	baseUrl: () => string
	/**
	 * Sent on every call. The backoffice needs `X-Auth-Audience`, because a
	 * server-side call carries no `Origin` and the API has no other way to tell
	 * which of the two sessions to read.
	 */
	defaultHeaders?: Record<string, string>
}

/**
 * The two apps address different audiences on the same API, so the fetcher is a
 * factory rather than a function: everything but the default headers is
 * identical, and was written twice before this.
 */
export function createApiFetch({
	baseUrl,
	defaultHeaders = {},
}: CreateApiFetchOptions) {
	return async function apiFetch<T>(
		path: string,
		init?: RequestInit,
	): Promise<T> {
		const response = await fetch(`${baseUrl()}${path}`, {
			...init,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...defaultHeaders,
				...init?.headers,
			},
		})

		if (!response.ok) {
			const body = (await response
				.json()
				.catch(() => null)) as ApiErrorBody | null

			throw new ApiError(
				response.status,
				body
					? toApiErrorMessage(body, response.statusText)
					: response.statusText,
			)
		}

		if (response.status === 204) {
			return undefined as T
		}

		const text = await response.text()

		return text ? (JSON.parse(text) as T) : (undefined as T)
	}
}
