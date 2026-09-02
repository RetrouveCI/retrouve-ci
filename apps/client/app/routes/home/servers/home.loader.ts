import { getServerSession } from '@/shared/helpers/session.server'
import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import type { LostItem } from '@/shared/types/lost-item'
import type { StickerActivationSummary } from '@/shared/types/sticker'
import { getLostItems } from '../../posts/servers/lost-items.service'
import { getMyStickerSummary } from '../../account/stickers/servers/stickers.service'

/** Fills the desktop row of four and leaves the phone strip one card to peek. */
export const RECENT_LISTINGS_COUNT = 4

export interface HomeRecentListings {
	listings: LostItem[]
	/** Published listings — the one public figure the API already counts. */
	total: number
}

export interface HomeLoaderData {
	recent: HomeRecentListings | null
	stickers: StickerActivationSummary | null
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
	const [recent, stickers] = await Promise.all([
		loadRecent(),
		loadStickerSummary(request),
	])

	return { recent, stickers }
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

/**
 * The banner is read from the home loader rather than beside it, so it is there
 * on the first paint the day the stickers arrive. An anonymous visitor costs
 * one session check and no more — and the whole thing is swallowed on failure,
 * because a banner must never take the first screen of the product down.
 */
async function loadStickerSummary(
	request: Request,
): Promise<StickerActivationSummary | null> {
	try {
		const session = await getServerSession(request)
		if (!session) return null

		return await getMyStickerSummary(request)
	} catch {
		return null
	}
}
