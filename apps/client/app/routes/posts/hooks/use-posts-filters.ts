import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LostItemType, LostItemCategory } from '@/shared/types/lost-item'
import { looksLikePhrase } from '@/routes/search/helpers/phrase'
import {
	ASSISTANT_PARAM,
	PHRASE_PARAM,
	toAssistantOutcome,
} from '@/routes/search/search.const'
import { toValidDate } from '../helpers/parse-posts-filters'
import {
	DATE_PRESET_CHIP_LABELS,
	matchDateFilter,
	presetDateFrom,
	type DateFilterMode,
} from '../helpers/date-presets'

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
	// The cast has to come *after* the fallback: `get() as LostItemType` asserts
	// away the `null`, which made `?? 'all'` dead code and hid « all » from the
	// type — so nothing downstream could be told the filter was off.
	const activeTab = (searchParams.get('type') ?? 'all') as LostItemType | 'all'
	const activeCategory = (searchParams.get('category') ?? 'all') as
		LostItemCategory | 'all'
	const filterVille = searchParams.get('ville') ?? 'all'
	const filterCommune = searchParams.get('commune') ?? 'all'
	const dateFrom = searchParams.get('dateFrom')
	const dateTo = searchParams.get('dateTo')
	const currentPage = Number(searchParams.get('page')) || 1

	/**
	 * What the assistant answered, and the sentence it answered about. Both live
	 * in the URL rather than in state, so the banner survives a reload and the
	 * page the visitor lands on is the page they can share.
	 */
	const assistantOutcome = toAssistantOutcome(searchParams.get(ASSISTANT_PARAM))
	const assistantPhrase = searchParams.get(PHRASE_PARAM) ?? ''

	const from = toValidDate(dateFrom)
	const dateRange: DateRange | undefined = from
		? { from, to: toValidDate(dateTo) }
		: undefined
	const dateFilter = matchDateFilter(dateFrom, dateTo)

	/**
	 * The row density, not the photo grid. Below `sm` the grid is a single column,
	 * so the toggle chose between two densities rather than between two layouts —
	 * the wireframe's decision note asks for one density on a phone and drops the
	 * control there. The row is also the cheaper of the two: it paints a 160 px
	 * thumbnail where a grid card paints 1000 px, so it is the right default at
	 * every width, and above `sm` the photo grid is one tap away.
	 */
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

	const [searchQuery, setSearchQuery] = useState(urlQuery)

	const setParams = useCallback(
		(mutate: (next: URLSearchParams) => void, resetPage = true) => {
			setSearchParams(
				prev => {
					const next = new URLSearchParams(prev)
					mutate(next)
					if (resetPage) next.delete('page')
					// The banner explains the state the assistant produced; touching a
					// filter by hand ends that state, so the explanation goes with it.
					next.delete(ASSISTANT_PARAM)
					next.delete(PHRASE_PARAM)
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

	/**
	 * A sentence is not a text search: filtering « j'ai perdu ma carte d'identité
	 * à Cocody mardi » word by word empties the list long before it is finished,
	 * and Enter would then have fixed a list the visitor had already watched go
	 * blank. So while a phrase is being written, the live filter stands still —
	 * the same judge the action uses to decide whether to spend an extraction.
	 */
	useEffect(() => {
		if (searchQuery === urlQuery || looksLikePhrase(searchQuery)) return
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

	/** The three one-tap periods. `custom` only reveals the calendar. */
	const setDateFilter = (mode: DateFilterMode) => {
		if (mode === 'custom') return
		setParams(next => {
			next.delete('dateTo')
			if (mode === 'all') next.delete('dateFrom')
			else next.set('dateFrom', presetDateFrom(mode))
		})
	}

	const setCurrentPage = (page: number) => {
		setParams(next => {
			if (page > 1) next.set('page', String(page))
			else next.delete('page')
		}, false)
	}

	/**
	 * « Réinitialiser » empties the sheet, so it covers the five groups the sheet
	 * draws — not only the three that carry a chip.
	 */
	const resetFilters = () => {
		setParams(next => {
			for (const key of [
				'type',
				'category',
				'ville',
				'commune',
				'dateFrom',
				'dateTo',
			])
				next.delete(key)
		})
	}

	/**
	 * The badge and the chips cover the three filters with no permanent control
	 * on the page. Type and category are always visible as pills, so counting
	 * them would send someone into the sheet to find what is already on screen.
	 */
	const activeFiltersCount = [
		filterVille !== 'all',
		filterCommune !== 'all',
		!!dateFrom,
	].filter(Boolean).length

	const hasActiveFilters =
		activeFiltersCount > 0 || activeTab !== 'all' || activeCategory !== 'all'

	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	const [isFilterSheetOpen, setFilterSheetOpen] = useState(false)
	const [snapshot, setSnapshot] = useState('')

	/**
	 * Filters apply live — « Voir N résultats » could not count anything
	 * otherwise — so « Annuler » has to restore what the URL held when the sheet
	 * opened. Dismissing the sheet any other way keeps the changes, as a bottom
	 * sheet does.
	 */
	const openFilterSheet = () => {
		setSnapshot(searchParams.toString())
		setFilterSheetOpen(true)
	}

	const cancelFilters = () => {
		setSearchParams(new URLSearchParams(snapshot), {
			replace: true,
			preventScrollReset: true,
		})
		setFilterSheetOpen(false)
	}

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
			label:
				dateFilter === '7d' || dateFilter === '30d'
					? DATE_PRESET_CHIP_LABELS[dateFilter]
					: dateRange.to
						? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM', { locale: fr })}`
						: `À partir du ${format(dateRange.from, 'd MMM', { locale: fr })}`,
			onRemove: () => setDateRange(undefined),
		})

	/** Any hand edit already clears the markers, so this is the empty one. */
	const dismissAssistant = () => setParams(() => {}, false)

	return {
		assistantOutcome,
		assistantPhrase,
		dismissAssistant,
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
		dateFilter,
		setDateFilter,
		isFilterSheetOpen,
		setFilterSheetOpen,
		openFilterSheet,
		cancelFilters,
		viewMode,
		setViewMode,
		activeFiltersCount,
		hasActiveFilters,
		totalPages,
		resetFilters,
		activeChips,
	}
}
