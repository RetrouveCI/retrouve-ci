import { createApiFetch } from '@app/web-kit/api'

export { ApiError } from '@app/web-kit/api'

/**
 * Server-side calls carry no `Origin`, so the API has no other way to know
 * which of the two sessions to read. Browser calls are decided by their
 * `Origin`, which takes precedence.
 */
export const apiFetch = createApiFetch({
	defaultHeaders: { 'X-Auth-Audience': 'admin' },
})
