import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import type { LostItemStatus } from '@/shared/types/lost-item'

/** « Toutes » is the absence of a filter, so it is never written to the URL. */
export type LifecycleFilter = LostItemStatus | 'all'

interface UseAccountPostsFiltersArgs {
	total: number
	pageSize: number
}

/**
 * URL-driven filters for « Mes annonces », the shape `usePostsFilters` gave
 * « Annonces »: the URL is the state, so the API does the filtering and the
 * Back button brings the filters back with the address.
 */
export function useAccountPostsFilters({
	total,
	pageSize,
}: UseAccountPostsFiltersArgs) {
	const [searchParams, setSearchParams] = useSearchParams()

	const urlQuery = searchParams.get('q') ?? ''
	// The fallback comes before the cast: `get() as LostItemStatus` would assert
	// the `null` away and make `?? 'all'` dead code.
	const status = (searchParams.get('status') ?? 'all') as LifecycleFilter
	const currentPage = Number(searchParams.get('page')) || 1

	const [searchQuery, setSearchQuery] = useState(urlQuery)

	const setParams = useCallback(
		(mutate: (next: URLSearchParams) => void, resetPage = true) => {
			setSearchParams(
				prev => {
					const next = new URLSearchParams(prev)
					mutate(next)
					if (resetPage) next.delete('page')
					return next
				},
				{ replace: true, preventScrollReset: true },
			)
		},
		[setSearchParams],
	)

	const setParam = useCallback(
		(key: string, value: string) => {
			setParams(next => {
				if (value && value !== 'all') next.set(key, value)
				else next.delete(key)
			})
		},
		[setParams],
	)

	useEffect(() => {
		setSearchQuery(urlQuery)
	}, [urlQuery])

	// Debounced, or every keystroke would be a round-trip to the API.
	useEffect(() => {
		if (searchQuery === urlQuery) return
		const timeout = setTimeout(() => setParam('q', searchQuery), 350)
		return () => clearTimeout(timeout)
	}, [searchQuery, urlQuery, setParam])

	const setStatus = (value: LifecycleFilter) => setParam('status', value)

	const setCurrentPage = (page: number) => {
		setParams(next => {
			if (page > 1) next.set('page', String(page))
			else next.delete('page')
		}, false)
	}

	const hasActiveFilters = status !== 'all' || urlQuery !== ''

	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	return {
		searchQuery,
		setSearchQuery,
		status,
		setStatus,
		currentPage,
		setCurrentPage,
		hasActiveFilters,
		totalPages,
	}
}
