import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import type { LostItem } from '@/shared/types/lost-item'
import { getLostItems } from '../../posts/servers/lost-items.service'

/** Fills the desktop row of four and leaves the phone strip one card to peek. */
export const RECENT_LISTINGS_COUNT = 4

export interface HomeRecentListings {
	listings: LostItem[]
	/** Published listings — the one public figure the API already counts. */
	total: number
}

export interface HomeLoaderData {
	recent: HomeRecentListings | null
}

/**
 * `null` is the error state, an empty `listings` the empty one: §2.3 rule 5
 * needs the two told apart. The home page renders for anonymous visitors and
 * had no loader at all before R17, so an unreachable API must leave it standing
 * rather than turn the first screen of the product into an error page.
 */
export async function homeLoader(): Promise<HomeLoaderData> {
	return { recent: await loadRecent() }
}

async function loadRecent(): Promise<HomeRecentListings | null> {
	try {
		const response = await getLostItems({ pageSize: RECENT_LISTINGS_COUNT })

		return {
			listings: response.items.map(toLostItem),
			total: response.total,
		}
	} catch {
		return null
	}
}
