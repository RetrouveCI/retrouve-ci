'use client'

import { useState, useMemo } from 'react'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
	Search,
	X,
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
	Package,
	Inbox,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Calendar,
	SlidersHorizontal,
	TrendingUp,
	LayoutGrid,
	List,
} from 'lucide-react'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@retrouve-ci/ui/components/ui/tabs'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@retrouve-ci/ui/components/ui/popover'
import { Calendar as CalendarComponent } from '@retrouve-ci/ui/components/ui/calendar'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components/ui/select'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard, type Listing } from '@/components/listing-card'
import { FloatingActionButton } from '@/components/floating-action-button'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/lib/ci-locations'
import { cn } from '@retrouve-ci/ui/lib/utils'

const ITEMS_PER_PAGE = 6

const today = new Date()
const daysAgo = (n: number) => {
	const d = new Date(today)
	d.setDate(d.getDate() - n)
	return d.toISOString().split('T')[0]
}

const mockListings: Listing[] = [
	{
		id: '1',
		title: 'iPhone 14 Pro noir',
		description:
			'Téléphone perdu dans un taxi à Cocody. Écran fissuré au coin. Récompense offerte.',
		location: 'Cocody, Abidjan',
		date: 'Il y a 2 jours',
		dateISO: daysAgo(2),
		type: 'lost',
		category: 'phones',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '2',
		title: 'Trousseau de clés avec porte-clés rouge',
		description:
			'Clés trouvées près de la pharmacie du marché de Treichville. 4 clés avec un porte-clés rouge.',
		location: 'Treichville, Abidjan',
		date: 'Il y a 1 jour',
		dateISO: daysAgo(1),
		type: 'found',
		category: 'keys',
	},
	{
		id: '3',
		title: 'Portefeuille en cuir marron',
		description:
			"Portefeuille perdu contenant des documents importants. Pas de récompense pour l'argent, juste les papiers.",
		location: 'Plateau, Abidjan',
		date: 'Il y a 3 jours',
		dateISO: daysAgo(3),
		type: 'lost',
		category: 'wallets',
	},
	{
		id: '4',
		title: 'Sac à dos noir Eastpak',
		description:
			'Sac trouvé au terminal de bus de Yopougon. Contient des livres et une trousse.',
		location: 'Yopougon, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found',
		category: 'bags',
	},
	{
		id: '5',
		title: 'MacBook Air M1 gris',
		description:
			'Ordinateur portable oublié dans un café. Autocollants sur le couvercle.',
		location: 'Marcory, Abidjan',
		date: 'Hier',
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'electronics',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '6',
		title: "Carte d'identité nationale",
		description:
			'Document trouvé près de la mairie. Nom partiellement visible.',
		location: 'Adjamé, Abidjan',
		date: 'Il y a 4 jours',
		dateISO: daysAgo(4),
		type: 'found',
		category: 'other',
	},
	{
		id: '7',
		title: 'Samsung Galaxy S23 bleu',
		description:
			"Téléphone retrouvé dans le bus SOTRA ligne 14. Fond d'écran avec une photo de famille.",
		location: 'Abobo, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found',
		category: 'phones',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '8',
		title: 'Sac à main rouge en cuir',
		description:
			'Sac perdu au centre commercial Cap Sud. Contient des documents et des effets personnels.',
		location: 'Koumassi, Abidjan',
		date: 'Il y a 2 jours',
		dateISO: daysAgo(2),
		type: 'lost',
		category: 'bags',
	},
	{
		id: '9',
		title: 'Clés de voiture Toyota',
		description:
			'Trousseau retrouvé sur le parking du supermarché Carrefour. Logo Toyota sur la télécommande.',
		location: 'Riviera, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found',
		category: 'keys',
	},
	{
		id: '10',
		title: 'Casque audio Sony blanc',
		description:
			"Casque oublié dans une salle d'attente. Modèle WH-1000XM4 avec pochette noire.",
		location: 'Plateau, Abidjan',
		date: 'Hier',
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'electronics',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '11',
		title: 'Carnet de santé enfant',
		description:
			'Carnet de santé trouvé devant le CHU de Treichville. Prénom : Kouamé.',
		location: 'Treichville, Abidjan',
		date: 'Il y a 5 jours',
		dateISO: daysAgo(5),
		type: 'found',
		category: 'other',
	},
	{
		id: '12',
		title: 'Portefeuille noir avec badge étudiant',
		description:
			"Perdu à l'université FHB. Badge étudiant visible à l'intérieur.",
		location: 'Cocody, Abidjan',
		date: 'Il y a 1 jour',
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'wallets',
	},
]

const categories = [
	{ id: 'all', label: 'Tous', icon: Package },
	{ id: 'phones', label: 'Téléphones', icon: Smartphone },
	{ id: 'keys', label: 'Clés', icon: Key },
	{ id: 'wallets', label: 'Portefeuilles', icon: Wallet },
	{ id: 'bags', label: 'Sacs', icon: Briefcase },
	{ id: 'electronics', label: 'Électronique', icon: Laptop },
	{ id: 'other', label: 'Autres', icon: Package },
]

const stats = [
	{ label: 'Annonces actives', value: '1 240' },
	{ label: 'Objets retrouvés', value: '890' },
	{ label: 'Villes couvertes', value: '30+' },
]

export default function AnnoncesPage() {
	const [searchQuery, setSearchQuery] = useState('')
	const [activeTab, setActiveTab] = useState('all')
	const [activeCategory, setActiveCategory] = useState('all')
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
		return mockListings.filter(listing => {
			const matchesSearch =
				listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				listing.location.toLowerCase().includes(searchQuery.toLowerCase())
			const matchesTab =
				activeTab === 'all' ||
				(activeTab === 'lost' && listing.type === 'lost') ||
				(activeTab === 'found' && listing.type === 'found')
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

	// Active filter chips
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

	return (
		<>
			<Header />
			<main className="flex-1">
				{/* ── Hero ── */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
						<div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
					</div>

					<div className="relative container mx-auto px-4 pt-12 pb-8">
						<div className="mx-auto max-w-2xl text-center">
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary-green)]/20 bg-[var(--primary-green)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary-green)]">
								<TrendingUp className="h-3.5 w-3.5" />
								{mockListings.length} annonces disponibles
							</div>
							<h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
								Objets{' '}
								<span className="text-[var(--primary-green)]">Perdus</span>{' '}
								&amp;{' '}
								<span className="text-[var(--accent-orange)]">Retrouvés</span>
							</h1>
							<p className="text-muted-foreground mb-8 text-base md:text-lg">
								Retrouvez votre objet ou aidez quelqu&apos;un à récupérer le
								sien.
							</p>

							{/* Search */}
							<div className="relative mx-auto max-w-xl">
								<div className="bg-background flex items-center gap-2 rounded-2xl border-2 px-4 shadow-sm transition-all focus-within:border-[var(--primary-green)]/50">
									<Search className="text-muted-foreground h-4 w-4 shrink-0" />
									<Input
										type="search"
										placeholder="Rechercher par objet, lieu..."
										value={searchQuery}
										onChange={e => {
											setSearchQuery(e.target.value)
											setCurrentPage(1)
										}}
										className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 md:text-base"
									/>
									{searchQuery && (
										<button
											onClick={() => {
												setSearchQuery('')
												setCurrentPage(1)
											}}
											className="hover:bg-muted rounded-full p-1 transition-colors"
											aria-label="Effacer"
										>
											<X className="text-muted-foreground h-3.5 w-3.5" />
										</button>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Stats bar */}
					<div className="bg-muted/30 border-t">
						<div className="container mx-auto px-4">
							<div className="flex items-center justify-center divide-x">
								{stats.map(s => (
									<div
										key={s.label}
										className="flex flex-col items-center px-8 py-3"
									>
										<span className="text-lg font-bold">{s.value}</span>
										<span className="text-muted-foreground text-xs">
											{s.label}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ── Listings ── */}
				<section className="py-8 md:py-10">
					<div className="container mx-auto px-4">
						<Tabs
							value={activeTab}
							onValueChange={v => {
								setActiveTab(v)
								setCurrentPage(1)
							}}
						>
							{/* Controls row */}
							<div className="mb-5 flex flex-col gap-3">
								<div className="flex flex-wrap items-center gap-3">
									{/* Tabs */}
									<TabsList className="bg-muted/60 h-10 rounded-xl p-1">
										<TabsTrigger
											value="all"
											className="data-[state=active]:bg-background rounded-lg px-4 text-sm data-[state=active]:shadow-sm"
										>
											Tous
										</TabsTrigger>
										<TabsTrigger
											value="lost"
											className="data-[state=active]:bg-background rounded-lg px-4 text-sm data-[state=active]:shadow-sm"
										>
											<span className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
											Perdus
										</TabsTrigger>
										<TabsTrigger
											value="found"
											className="data-[state=active]:bg-background rounded-lg px-4 text-sm data-[state=active]:shadow-sm"
										>
											<span className="mr-1.5 h-2 w-2 rounded-full bg-[var(--primary-green)]" />
											Retrouvés
										</TabsTrigger>
									</TabsList>

									{/* Right controls */}
									<div className="ml-auto flex items-center gap-2">
										{/* Filter toggle */}
										<button
											onClick={() => setShowFilters(v => !v)}
											className={cn(
												'flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-all',
												showFilters || activeFiltersCount > 0
													? 'border-[var(--primary-green)]/40 bg-[var(--primary-green)]/10 text-[var(--primary-green)]'
													: 'bg-background border-border text-muted-foreground hover:border-[var(--primary-green)]/30',
											)}
										>
											<SlidersHorizontal className="h-4 w-4" />
											<span className="hidden sm:inline">Filtres</span>
											{activeFiltersCount > 0 && (
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-green)] text-[10px] font-bold text-white">
													{activeFiltersCount}
												</span>
											)}
										</button>

										{/* View toggle */}
										<div className="bg-background flex items-center gap-0 overflow-hidden rounded-xl border p-0.5">
											<button
												onClick={() => setViewMode('grid')}
												aria-label="Vue grille"
												className={cn(
													'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
													viewMode === 'grid'
														? 'bg-[var(--primary-green)] text-white shadow-sm'
														: 'text-muted-foreground hover:text-foreground',
												)}
											>
												<LayoutGrid className="h-4 w-4" />
											</button>
											<button
												onClick={() => setViewMode('list')}
												aria-label="Vue liste"
												className={cn(
													'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
													viewMode === 'list'
														? 'bg-[var(--primary-green)] text-white shadow-sm'
														: 'text-muted-foreground hover:text-foreground',
												)}
											>
												<List className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>

								{/* Category chips */}
								<div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
									<div className="flex min-w-max gap-2">
										{categories.map(({ id, label, icon: Icon }) => {
											const isActive = activeCategory === id
											return (
												<button
													key={id}
													onClick={() => {
														setActiveCategory(id)
														setCurrentPage(1)
													}}
													className={cn(
														'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all',
														isActive
															? 'bg-foreground text-background border-foreground scale-[1.02] shadow-sm'
															: 'bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
													)}
												>
													<Icon className="h-3.5 w-3.5" />
													{label}
												</button>
											)
										})}
									</div>
								</div>
							</div>

							{/* Active filter chips */}
							{activeChips.length > 0 && (
								<div className="mb-4 flex flex-wrap items-center gap-2">
									<span className="text-muted-foreground text-xs">
										Filtres actifs :
									</span>
									{activeChips.map(chip => (
										<span
											key={chip.label}
											className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-green)]/20 bg-[var(--primary-green)]/10 px-3 py-1 text-xs font-medium text-[var(--primary-green)]"
										>
											{chip.label}
											<button
												onClick={chip.onRemove}
												aria-label="Retirer le filtre"
											>
												<X className="h-3 w-3 hover:opacity-70" />
											</button>
										</span>
									))}
									<button
										onClick={resetFilters}
										className="text-muted-foreground hover:text-destructive text-xs underline transition-colors"
									>
										Tout effacer
									</button>
								</div>
							)}

							{/* Filter panel */}
							{showFilters && (
								<div className="mb-5 rounded-2xl border-2 border-dashed border-[var(--primary-green)]/20 bg-[var(--primary-green)]/3 p-5">
									<div className="mb-4 flex items-center justify-between">
										<p className="flex items-center gap-2 text-sm font-semibold">
											<SlidersHorizontal className="h-4 w-4 text-[var(--primary-green)]" />
											Filtres avancés
										</p>
										{activeFiltersCount > 0 && (
											<button
												onClick={resetFilters}
												className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
											>
												<X className="h-3 w-3" />
												Réinitialiser tout
											</button>
										)}
									</div>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
										{/* Ville */}
										<div className="space-y-1.5">
											<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
												<MapPin className="h-3 w-3" />
												Ville
											</label>
											<Select
												value={filterVille}
												onValueChange={v => {
													setFilterVille(v)
													setFilterCommune('all')
													setCurrentPage(1)
												}}
											>
												<SelectTrigger className="bg-background h-10 rounded-xl text-sm">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Toutes les villes</SelectItem>
													{CI_VILLES.map(v => (
														<SelectItem key={v} value={v}>
															{v}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										{/* Commune */}
										<div className="space-y-1.5">
											<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
												<MapPin className="h-3 w-3" />
												Commune
											</label>
											<Select
												value={filterCommune}
												onValueChange={v => {
													setFilterCommune(v)
													setCurrentPage(1)
												}}
												disabled={filterVille !== 'Abidjan'}
											>
												<SelectTrigger className="bg-background h-10 rounded-xl text-sm">
													<SelectValue
														placeholder={
															filterVille === 'Abidjan' ? 'Toutes' : '—'
														}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Toutes les communes
													</SelectItem>
													{ABIDJAN_COMMUNES.map(c => (
														<SelectItem key={c} value={c}>
															{c}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										{/* Date range */}
										<div className="space-y-1.5">
											<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
												<Calendar className="h-3 w-3" />
												Période
											</label>
											<Popover>
												<PopoverTrigger asChild>
													<button
														className={cn(
															'bg-background hover:bg-muted/50 flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm transition-colors',
															dateRange?.from
																? 'text-foreground'
																: 'text-muted-foreground',
														)}
													>
														<Calendar className="h-3.5 w-3.5 shrink-0" />
														<span className="flex-1 truncate text-left">
															{dateRange?.from
																? dateRange.to
																	? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM yyyy', { locale: fr })}`
																	: `À partir du ${format(dateRange.from, 'd MMM yyyy', { locale: fr })}`
																: 'Sélectionner une période'}
														</span>
														{dateRange?.from && (
															<X
																className="text-muted-foreground hover:text-foreground h-3 w-3 shrink-0"
																onClick={e => {
																	e.stopPropagation()
																	setDateRange(undefined)
																	setCurrentPage(1)
																}}
															/>
														)}
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<CalendarComponent
														mode="range"
														selected={dateRange}
														onSelect={r => {
															setDateRange(r)
															setCurrentPage(1)
														}}
														disabled={{ after: new Date() }}
														locale={fr}
														numberOfMonths={1}
													/>
												</PopoverContent>
											</Popover>
										</div>
									</div>
								</div>
							)}

							{/* Results + Grid/List */}
							<TabsContent value={activeTab} className="mt-0">
								{paginatedListings.length > 0 ? (
									<>
										<p className="text-muted-foreground mb-4 text-xs">
											<span className="text-foreground font-semibold">
												{filteredListings.length}
											</span>{' '}
											résultat{filteredListings.length > 1 ? 's' : ''}
											{searchQuery && (
												<>
													{' '}
													pour{' '}
													<span className="font-medium">
														&quot;{searchQuery}&quot;
													</span>
												</>
											)}
										</p>

										{viewMode === 'grid' ? (
											<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
												{paginatedListings.map(listing => (
													<ListingCard
														key={listing.id}
														listing={listing}
														variant="grid"
													/>
												))}
											</div>
										) : (
											<div className="flex flex-col gap-3">
												{paginatedListings.map(listing => (
													<ListingCard
														key={listing.id}
														listing={listing}
														variant="list"
													/>
												))}
											</div>
										)}

										{/* Pagination */}
										{totalPages > 1 && (
											<div className="mt-10 flex items-center justify-center gap-2">
												<Button
													variant="outline"
													size="icon"
													className="h-10 w-10 rounded-xl"
													onClick={() =>
														setCurrentPage(p => Math.max(1, p - 1))
													}
													disabled={currentPage === 1}
													aria-label="Page précédente"
												>
													<ChevronLeft className="h-4 w-4" />
												</Button>
												<div className="flex items-center gap-1">
													{Array.from(
														{ length: totalPages },
														(_, i) => i + 1,
													).map(page => (
														<button
															key={page}
															onClick={() => setCurrentPage(page)}
															className={cn(
																'h-10 w-10 rounded-xl text-sm font-medium transition-all',
																page === currentPage
																	? 'bg-[var(--primary-green)] text-white shadow-sm'
																	: 'hover:bg-muted text-muted-foreground',
															)}
															aria-current={
																page === currentPage ? 'page' : undefined
															}
														>
															{page}
														</button>
													))}
												</div>
												<Button
													variant="outline"
													size="icon"
													className="h-10 w-10 rounded-xl"
													onClick={() =>
														setCurrentPage(p => Math.min(totalPages, p + 1))
													}
													disabled={currentPage === totalPages}
													aria-label="Page suivante"
												>
													<ChevronRight className="h-4 w-4" />
												</Button>
											</div>
										)}
									</>
								) : (
									<div className="bg-muted/10 rounded-2xl border-2 border-dashed py-24 text-center">
										<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
											<Inbox className="text-muted-foreground/50 h-8 w-8" />
										</div>
										<h3 className="mb-1 text-base font-semibold">
											Aucune annonce trouvée
										</h3>
										<p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
											{searchQuery
												? `Aucun résultat pour "${searchQuery}".`
												: 'Soyez le premier à publier dans cette catégorie.'}
										</p>
										<Button
											asChild
											className="rounded-xl bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
										>
											<a href="/publier">Publier une annonce</a>
										</Button>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</section>
			</main>

			<FloatingActionButton href="/publier" />
			<Footer />
		</>
	)
}
