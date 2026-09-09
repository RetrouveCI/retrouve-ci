import { getPublicCounters } from './counters.service'
import type { PublicCountersApiResponse } from './counters.service'

export type PublicCounters = PublicCountersApiResponse

// `null` when the API cannot answer, so a screen draws no band rather than
// announcing a zero — a sign-in page must survive an outage.
export async function loadPublicCounters(
	request: Request,
): Promise<PublicCounters | null> {
	try {
		return await getPublicCounters(request)
	} catch {
		return null
	}
}
