import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import type { LostItem } from '@/shared/types/lost-item'
import { getLostItems } from '../../posts/servers/lost-items.service'
import { loadPublicCounters } from './public-counters'
import type { PublicCounters } from './public-counters'

/** Fills the desktop row of four and leaves the phone strip one card to peek. */
export const RECENT_LISTINGS_COUNT = 4

export interface HomeRecentListings {
	listings: LostItem[]
}

export interface HomeLoaderData {
	recent: HomeRecentListings | null
	// ⚠️ Not the list response's `total`, which counts what that query matched:
	// the sign-in panel says the same phrase, and one phrase carries one figure.
	counters: PublicCounters | null
}

/**
 * `null` is the error state, an empty `listings` the empty one: §2.3 rule 5
 * needs the two told apart. The home page renders for anonymous visitors and
 * had no loader at all before R17, so an unreachable API must leave it standing
 * rather than turn the first screen of the product into an error page.
 */
export async function homeLoader({
	request,
}: {
	request: Request
}): Promise<HomeLoaderData> {
	const [recent, counters] = await Promise.all([
		loadRecent(request),
		loadPublicCounters(request),
	])

	return { recent, counters }
}

async function loadRecent(
	request: Request,
): Promise<HomeRecentListings | null> {
	try {
		const response = await getLostItems(
			{ pageSize: RECENT_LISTINGS_COUNT },
			request,
		)

		return { listings: response.items.map(toLostItem) }
	} catch {
		return null
	}
}
