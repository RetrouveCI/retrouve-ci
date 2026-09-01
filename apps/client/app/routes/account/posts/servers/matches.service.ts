import { apiFetch } from '@/shared/utils/api-fetch'
import type { MatchCandidateApiDto } from '@/shared/types/lost-items.types'

/**
 * `GET /lost-items/:id/matches` is the matching domain's own endpoint, not the
 * public list narrowed by hand: it searches the opposite type, keeps only
 * published listings that are still active, and scores what it finds. A list
 * query cannot express any of the three — `/lost-items` has no
 * `resolutionStatus` filter, so it would offer objects already handed back.
 */
export async function getListingMatches(
	id: string,
	request: Request,
): Promise<MatchCandidateApiDto[]> {
	return apiFetch<MatchCandidateApiDto[]>(`/lost-items/${id}/matches`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
