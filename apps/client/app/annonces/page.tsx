'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@retrouve-ci/ui/components'
import {
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
	Package,
	SlidersHorizontal,
	LayoutGrid,
	List,
	X,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingActionButton } from '@/components/floating-action-button'
import { AnnoncesHero } from '@/components/annonces/annonces-hero'
import { FilterPanel } from '@/components/annonces/filter-panel'
import { ListingsContent } from '@/components/annonces/listings-content'
import { useAnnoncesFilters } from '@/hooks/use-annonces-filters'
import { cn } from '@retrouve-ci/ui/utils'
import type { ListingType, ListingCategory } from '@/domain/entities/listing'

const CATEGORIES: {
	id: ListingCategory | 'all'
	label: string
	icon: React.ElementType
}[] = [
	{ id: 'all', label: 'Tous', icon: Package },
	{ id: 'phones', label: 'Téléphones', icon: Smartphone },
	{ id: 'keys', label: 'Clés', icon: Key },
	{ id: 'wallets', label: 'Portefeuilles', icon: Wallet },
	{ id: 'bags', label: 'Sacs', icon: Briefcase },
	{ id: 'electronics', label: 'Électronique', icon: Laptop },
	{ id: 'other', label: 'Autres', icon: Package },
]

export default function AnnoncesPage() {
	const {
		listings,
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
		toggleFilters,
		viewMode,
		setViewMode,
		activeFiltersCount,
		filteredListings,
		paginatedListings,
		totalPages,
		resetFilters,
		activeChips,
	} = useAnnoncesFilters()

	return (
		<>
			<Header />
			<main className="flex-1">
				<AnnoncesHero
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					listingsCount={listings.length}
				/>

				<section className="py-8 md:py-10">
					<div className="container mx-auto px-4">
						<Tabs
							value={activeTab}
							onValueChange={v => setActiveTab(v as ListingType | 'all')}
						>
							<div className="mb-5 flex flex-col gap-3">
								<div className="flex flex-wrap items-center gap-3">
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
											<span className="mr-1.5 h-2 w-2 rounded-full bg-primary-green" />
											Retrouvés
										</TabsTrigger>
									</TabsList>

									<div className="ml-auto flex items-center gap-2">
										<button
											onClick={toggleFilters}
											className={cn(
												'flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-all',
												showFilters || activeFiltersCount > 0
													? 'border-primary-green/40 bg-primary-green/10 text-primary-green'
													: 'bg-background border-border text-muted-foreground hover:border-primary-green/30',
											)}
										>
											<SlidersHorizontal className="h-4 w-4" />
											<span className="hidden sm:inline">Filtres</span>
											{activeFiltersCount > 0 && (
												<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-green text-[10px] font-bold text-white">
													{activeFiltersCount}
												</span>
											)}
										</button>

										<div className="bg-background flex items-center gap-0 overflow-hidden rounded-xl border p-0.5">
											<button
												onClick={() => setViewMode('grid')}
												aria-label="Vue grille"
												className={cn(
													'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
													viewMode === 'grid'
														? 'bg-primary-green text-white shadow-sm'
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
														? 'bg-primary-green text-white shadow-sm'
														: 'text-muted-foreground hover:text-foreground',
												)}
											>
												<List className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>

								<div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
									<div className="flex min-w-max gap-2">
										{CATEGORIES.map(({ id, label, icon: Icon }) => (
											<button
												key={id}
												onClick={() => setActiveCategory(id)}
												className={cn(
													'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all',
													activeCategory === id
														? 'bg-foreground text-background border-foreground scale-[1.02] shadow-sm'
														: 'bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
												)}
											>
												<Icon className="h-3.5 w-3.5" />
												{label}
											</button>
										))}
									</div>
								</div>
							</div>

							{activeChips.length > 0 && (
								<div className="mb-4 flex flex-wrap items-center gap-2">
									<span className="text-muted-foreground text-xs">
										Filtres actifs :
									</span>
									{activeChips.map(chip => (
										<span
											key={chip.label}
											className="inline-flex items-center gap-1.5 rounded-full border border-primary-green/20 bg-primary-green/10 px-3 py-1 text-xs font-medium text-primary-green"
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

							{showFilters && (
								<FilterPanel
									filterVille={filterVille}
									filterCommune={filterCommune}
									dateRange={dateRange}
									activeFiltersCount={activeFiltersCount}
									onVilleChange={setFilterVille}
									onCommuneChange={setFilterCommune}
									onDateChange={setDateRange}
									onReset={resetFilters}
								/>
							)}

							<TabsContent value={activeTab} className="mt-0">
								<ListingsContent
									paginatedListings={paginatedListings}
									filteredCount={filteredListings.length}
									viewMode={viewMode}
									searchQuery={searchQuery}
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
								/>
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
