import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { PALETTE_MIN_QUERY } from '../palette.const'
import type { loader } from '../servers/palette.loader'
import type { PaletteHit } from '../types/palette.types'

const DEBOUNCE_MS = 250

/** Hits for the query being typed; an answer to an older query is ignored. */
export function usePaletteSearch(query: string): {
	hits: PaletteHit[]
	searching: boolean
} {
	const fetcher = useFetcher<typeof loader>()
	const trimmed = query.trim()
	const searchable = trimmed.length >= PALETTE_MIN_QUERY

	useEffect(() => {
		if (!searchable) return

		const timer = setTimeout(() => {
			void fetcher.load(`/palette?q=${encodeURIComponent(trimmed)}`)
		}, DEBOUNCE_MS)

		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trimmed, searchable])

	const answered = searchable && fetcher.data?.query === trimmed

	return {
		hits: answered ? (fetcher.data?.hits ?? []) : [],
		searching: searchable && !answered,
	}
}
