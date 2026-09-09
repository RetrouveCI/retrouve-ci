import { requireServerSession } from '@/shared/helpers/session.server'
import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import { ACCOUNT_POSTS_PAGE_SIZE } from '../helpers/parse-account-posts-filters'
import type { ListingMatches, ListingMatchesMap } from '../types/matches'
import { getListingMatches } from './matches.service'

/** How many candidates the sheet lists; the band still announces the real count. */
const MAX_LISTED = 4

/**
 * One call for the whole page rather than one per card. Twelve cards would
 * otherwise open twelve browser requests at once, each of them sweeping a
 * hundred candidates server-side; here the browser asks once and the loader
 * fans out over the API, which it reaches without a round trip through the
 * network.
 *
 * The module exports nothing but `loader`: React Router only strips server
 * code from that export, so a second one would drag the session helper into
 * the browser bundle.
 */
export async function loader({ request }: { request: Request }) {
	await requireServerSession(request)

	const ids = readIds(new URL(request.url).searchParams)
	if (ids.length === 0) return { matches: {} as ListingMatchesMap }

	const entries = await Promise.all(
		ids.map(async id => [id, await summarize(id, request)] as const),
	)

	return {
		matches: Object.fromEntries(
			entries.filter(([, value]) => value !== null),
		) as ListingMatchesMap,
	}
}

/**
 * A listing with no match, one the matching endpoint refuses (it requires a
 * published source) and an outright failure all read the same way: no band.
 * The band is an addition to a card that already stands on its own.
 */
async function summarize(
	id: string,
	request: Request,
): Promise<ListingMatches | null> {
	try {
		const candidates = await getListingMatches(id, request)
		if (candidates.length === 0) return null

		return {
			count: candidates.length,
			items: candidates
				.slice(0, MAX_LISTED)
				.map(candidate => toLostItem(candidate.lostItem)),
		}
	} catch {
		return null
	}
}

function readIds(params: URLSearchParams): string[] {
	const raw = params.get('ids')
	if (!raw) return []

	return [...new Set(raw.split(',').filter(Boolean))].slice(
		0,
		ACCOUNT_POSTS_PAGE_SIZE,
	)
}
