import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type {
	LostItem,
	LostItemType,
	LostItemCategory,
} from '@/shared/types/lost-item'

const ITEMS_PER_PAGE = 6

export function usePostsFilters(listings: LostItem[]) {
	const [searchParams] = useSearchParams()
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
	const [activeTab, setActiveTab] = useState<LostItemType | 'all'>('all')
	const [activeCategory, setActiveCategory] = useState<
		LostItemCategory | 'all'
	>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [filterVille, setFilterVille] = useState('all')
	const [filterCommune, setFilterCommune] = useState('all')
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const [showFilters, setShowFilters] = useState(false)
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

	const activeFiltersCount = [
		filterVille !== 'all',
		filterCommune !== 'all',
		!!dateRange?.from,
	].filter(Boolean).length

	const filteredListings = useMemo(() => {
		return listings.filter(listing => {
			const matchesSearch =
				listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.location.toLowerCase().includes(searchQuery.toLowerCase())
			const matchesTab = activeTab === 'all' || listing.type === activeTab
			const matchesCategory =
				activeCategory === 'all' || listing.category === activeCategory
			const matchesVille =
				filterVille === 'all' ||
				listing.location.toLowerCase().includes(filterVille.toLowerCase())
			const matchesCommune =
				filterCommune === 'all' ||
				listing.location.toLowerCase().includes(filterCommune.toLowerCase())

			let matchesDate = true
			if (dateRange?.from && listing.dateISO) {
				const listingDate = new Date(listing.dateISO)
				const from = new Date(dateRange.from)
				from.setHours(0, 0, 0, 0)
				if (dateRange.to) {
					const to = new Date(dateRange.to)
					to.setHours(23, 59, 59, 999)
					matchesDate = listingDate >= from && listingDate <= to
				} else {
					matchesDate = listingDate >= from
				}
			}

			return (
				matchesSearch &&
				matchesTab &&
				matchesCategory &&
				matchesVille &&
				matchesCommune &&
				matchesDate
			)
		})
	}, [
		listings,
		searchQuery,
		activeTab,
		activeCategory,
		filterVille,
		filterCommune,
		dateRange,
	])

	const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE)
	const paginatedListings = filteredListings.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	)

	const resetFilters = () => {
		setFilterVille('all')
		setFilterCommune('all')
		setDateRange(undefined)
		setCurrentPage(1)
	}

	const activeChips: { label: string; onRemove: () => void }[] = []
	if (filterVille !== 'all')
		activeChips.push({
			label: filterVille,
			onRemove: () => {
				setFilterVille('all')
				setFilterCommune('all')
				setCurrentPage(1)
			},
		})
	if (filterCommune !== 'all')
		activeChips.push({
			label: filterCommune,
			onRemove: () => {
				setFilterCommune('all')
				setCurrentPage(1)
			},
		})
	if (dateRange?.from)
		activeChips.push({
			label: dateRange.to
				? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM', { locale: fr })}`
				: `À partir du ${format(dateRange.from, 'd MMM', { locale: fr })}`,
			onRemove: () => {
				setDateRange(undefined)
				setCurrentPage(1)
			},
		})

	return {
		searchQuery,
		setSearchQuery: (q: string) => {
			setSearchQuery(q)
			setCurrentPage(1)
		},
		activeTab,
		setActiveTab: (t: LostItemType | 'all') => {
			setActiveTab(t)
			setCurrentPage(1)
		},
		activeCategory,
		setActiveCategory: (c: LostItemCategory | 'all') => {
			setActiveCategory(c)
			setCurrentPage(1)
		},
		currentPage,
		setCurrentPage,
		filterVille,
		setFilterVille: (v: string) => {
			setFilterVille(v)
			setFilterCommune('all')
			setCurrentPage(1)
		},
		filterCommune,
		setFilterCommune: (c: string) => {
			setFilterCommune(c)
			setCurrentPage(1)
		},
		dateRange,
		setDateRange: (r: DateRange | undefined) => {
			setDateRange(r)
			setCurrentPage(1)
		},
		showFilters,
		toggleFilters: () => setShowFilters(v => !v),
		viewMode,
		setViewMode,
		activeFiltersCount,
		filteredListings,
		paginatedListings,
		totalPages,
		resetFilters,
		activeChips,
	}
}
