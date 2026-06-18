import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LostItemType, LostItemCategory } from '@/shared/types/lost-item'

interface UsePostsFiltersArgs {
	total: number
	pageSize: number
}

/**
 * URL-driven filters for the posts list. Every filter writes to the URL search
 * params so the route loader re-runs and the API performs the filtering — no
 * client-side filtering. The text search is debounced before hitting the URL.
 */
export function usePostsFilters({ total, pageSize }: UsePostsFiltersArgs) {
	const [searchParams, setSearchParams] = useSearchParams()

	const urlQuery = searchParams.get('q') ?? ''
	const activeTab = (searchParams.get('type') as LostItemType) ?? 'all'
	const activeCategory =
		(searchParams.get('category') as LostItemCategory) ?? 'all'
	const filterVille = searchParams.get('ville') ?? 'all'
	const filterCommune = searchParams.get('commune') ?? 'all'
	const dateFrom = searchParams.get('dateFrom')
	const dateTo = searchParams.get('dateTo')
	const currentPage = Number(searchParams.get('page')) || 1

	const dateRange: DateRange | undefined = dateFrom
		? { from: new Date(dateFrom), to: dateTo ? new Date(dateTo) : undefined }
		: undefined

	const [showFilters, setShowFilters] = useState(false)
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

	useEffect(() => {
		if (searchQuery === urlQuery) return
		const timeout = setTimeout(() => setParam('q', searchQuery), 350)
		return () => clearTimeout(timeout)
	}, [searchQuery, urlQuery, setParam])

	const setActiveTab = (value: LostItemType | 'all') => setParam('type', value)
	const setActiveCategory = (value: LostItemCategory | 'all') =>
		setParam('category', value)
	const setFilterCommune = (value: string) => setParam('commune', value)

	const setFilterVille = (value: string) => {
		setParams(next => {
			if (value && value !== 'all') next.set('ville', value)
			else next.delete('ville')
			next.delete('commune')
		})
	}

	const setDateRange = (range: DateRange | undefined) => {
		setParams(next => {
			if (range?.from) next.set('dateFrom', format(range.from, 'yyyy-MM-dd'))
			else next.delete('dateFrom')
			if (range?.to) next.set('dateTo', format(range.to, 'yyyy-MM-dd'))
			else next.delete('dateTo')
		})
	}

	const setCurrentPage = (page: number) => {
		setParams(next => {
			if (page > 1) next.set('page', String(page))
			else next.delete('page')
		}, false)
	}

	const resetFilters = () => {
		setParams(next => {
			next.delete('ville')
			next.delete('commune')
			next.delete('dateFrom')
			next.delete('dateTo')
		})
	}

	const activeFiltersCount = [
		filterVille !== 'all',
		filterCommune !== 'all',
		!!dateFrom,
	].filter(Boolean).length

	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	const activeChips: { label: string; onRemove: () => void }[] = []
	if (filterVille !== 'all')
		activeChips.push({
			label: filterVille,
			onRemove: () => setFilterVille('all'),
		})
	if (filterCommune !== 'all')
		activeChips.push({
			label: filterCommune,
			onRemove: () => setFilterCommune('all'),
		})
	if (dateRange?.from)
		activeChips.push({
			label: dateRange.to
				? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM', { locale: fr })}`
				: `À partir du ${format(dateRange.from, 'd MMM', { locale: fr })}`,
			onRemove: () => setDateRange(undefined),
		})

	return {
		searchQuery,
		setSearchQuery,
		activeTab,
		setActiveTab,
		activeCategory,
		setActiveCategory,
		currentPage,
		setCurrentPage,
		filterVille,
		setFilterVille,
		filterCommune,
		setFilterCommune,
		dateRange,
		setDateRange,
		showFilters,
		toggleFilters: () => setShowFilters(v => !v),
		viewMode,
		setViewMode,
		activeFiltersCount,
		totalPages,
		resetFilters,
		activeChips,
	}
}
