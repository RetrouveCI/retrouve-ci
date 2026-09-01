import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import type { UserLostItem } from '@/shared/types/lost-item'
import { acceptsMatches } from '../helpers/listing-matches'
import type { ListingMatchesMap } from '../types/matches'

const EMPTY: ListingMatchesMap = {}

/**
 * Matches load beside the page, never inside its loader: the list must not
 * wait on them, and a card without a band is complete. One request covers the
 * whole page — see `matches.loader.ts` for why it is not one per card.
 */
export function useListingMatches(listings: UserLostItem[]): ListingMatchesMap {
	const fetcher = useFetcher<{ matches: ListingMatchesMap }>()
	const ids = listings.filter(acceptsMatches).map(listing => listing.id)
	const key = ids.join(',')

	useEffect(() => {
		if (!key) return

		fetcher.load(`/account/posts/matches?ids=${encodeURIComponent(key)}`)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key])

	return key ? (fetcher.data?.matches ?? EMPTY) : EMPTY
}
