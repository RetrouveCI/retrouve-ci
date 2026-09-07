import { ApiError, toApiErrorMessage, type ApiErrorBody } from './api-error'

/** What the API's rate limiter keys a bucket on. */
export const CLIENT_IP_HEADER = 'X-Client-Ip'

function firstHop(request: Request, header: string): string | undefined {
	return request.headers.get(header)?.split(',')[0]?.trim() || undefined
}

/** The first hop only: the API trusts it as given, a chain would name a proxy. */
export function callerAddress(request: Request): string | undefined {
	return firstHop(request, 'x-forwarded-for') ?? firstHop(request, 'x-real-ip')
}

// Passing `request` lets a server-side call speak for the visitor rather than
// for this container: it carries the cookie and the address the rate limiter
// keys on. Without it every visitor of a capped route shared one bucket (R44).
export type ApiFetchInit = RequestInit & { request?: Request }

function forwardedHeaders(request: Request): Record<string, string> {
	const address = callerAddress(request)

	return {
		Cookie: request.headers.get('cookie') ?? '',
		...(address ? { [CLIENT_IP_HEADER]: address } : {}),
	}
}

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
		init?: ApiFetchInit,
	): Promise<T> {
		const { request, ...rest } = init ?? {}

		const response = await fetch(`${baseUrl()}${path}`, {
			...rest,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...defaultHeaders,
				...(request ? forwardedHeaders(request) : {}),
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
