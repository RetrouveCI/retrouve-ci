import { apiFetch } from '@/shared/utils/api-fetch'

/** The API answers two bare numbers; §3 forbids writing either by hand. */
export interface PublicCountersApiResponse {
	published: number
	resolvedThisMonth: number
}

export function getPublicCounters(
	request: Request,
): Promise<PublicCountersApiResponse> {
	return apiFetch<PublicCountersApiResponse>('/stats/counters', { request })
}
