import { SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { PostsHero } from './components/posts-hero'
import { FilterPill } from '@/components/filter-pill'
import { FilterSheet } from './components/filter-sheet'
import { ListingsContent } from './components/listings-content'
import { usePostsFilters } from './hooks/use-posts-filters'
import { postsLoader } from './servers/lost-items.loader'
import { CATEGORY_FILTERS, TYPE_FILTERS } from './posts.const'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export const loader = postsLoader

export function meta() {
	return pageMeta({
		title: 'Annonces',
		description: 'Parcourez les objets perdus et retrouvés sur RetrouveCI.',
	})
}

export default function AnnoncesPage({ loaderData }: Route.ComponentProps) {
	const { listings, total, pageSize } = loaderData

	const {
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
	} = usePostsFilters({ total, pageSize })

	return (
		<main className="flex-1">
			<PostsHero
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				listingsCount={total}
			/>

			<section className="py-8 md:py-10">
				<div className="container mx-auto px-4">
					<div className="mb-5 flex flex-col gap-3">
						<div className="flex flex-wrap items-center gap-3">
							{/**
							 * Type and category are the same role — a filter pill — so they
							 * take the same form here and in the sheet (§2.1). They were a
							 * `TabsList` beside a row of pills, two shapes for one job.
							 */}
							<div
								className="flex flex-wrap gap-2"
								role="group"
								aria-label="Type d'annonce"
							>
								{TYPE_FILTERS.map(({ id, label, dotClassName }) => (
									<FilterPill
										key={id}
										active={activeTab === id}
										onClick={() => setActiveTab(id)}
									>
										{dotClassName && (
											<span
												className={cn('h-1.5 w-1.5 rounded-full', dotClassName)}
											/>
										)}
										{label}
									</FilterPill>
								))}
							</div>

							<div className="ml-auto flex items-center gap-2">
								<button
									type="button"
									onClick={openFilterSheet}
									aria-haspopup="dialog"
									// Below `sm` the word is hidden, which left the button with
									// no accessible name at all on a phone.
									aria-label="Filtres"
									className={cn(
										'flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-all lg:h-10',
										activeFiltersCount > 0
											? 'border-primary-green/40 bg-primary-green/10 text-primary-green-text'
											: 'bg-background border-border text-muted-foreground hover:border-primary-green/30',
									)}
								>
									<SlidersHorizontal className="h-4 w-4" />
									<span className="hidden sm:inline">Filtres</span>
									{activeFiltersCount > 0 && (
										<span className="bg-primary-green inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
											{activeFiltersCount}
										</span>
									)}
								</button>

								{/**
								 * Below `sm` the grid is one column, so this chose between two
								 * densities and not between two layouts. The phone keeps the
								 * single density the wireframe draws.
								 */}
								<div className="bg-background hidden items-center gap-0 overflow-hidden rounded-xl border p-0.5 sm:flex">
									<button
										onClick={() => setViewMode('grid')}
										aria-label="Vue grille"
										className={cn(
											'flex size-11 items-center justify-center rounded-lg transition-all lg:size-9',
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
											'flex size-11 items-center justify-center rounded-lg transition-all lg:size-9',
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
							<div
								className="flex min-w-max gap-2"
								role="group"
								aria-label="Catégorie"
							>
								{CATEGORY_FILTERS.map(({ id, label, icon: Icon }) => (
									<button
										key={id}
										type="button"
										onClick={() => setActiveCategory(id)}
										aria-pressed={activeCategory === id}
										className={cn(
											'touch-target flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all',
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
									className="border-primary-green/20 bg-primary-green/10 text-primary-green-text inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
								>
									{chip.label}
									<button
										onClick={chip.onRemove}
										aria-label={`Retirer le filtre ${chip.label}`}
									>
										<X className="h-3 w-3 hover:opacity-70" />
									</button>
								</span>
							))}
							{/* The same action as the sheet's, so the same word (§2.3, rule 3). */}
							<button
								onClick={resetFilters}
								className="text-muted-foreground hover:text-destructive text-xs underline transition-colors"
							>
								Réinitialiser
							</button>
						</div>
					)}

					<ListingsContent
						paginatedListings={listings}
						filteredCount={total}
						viewMode={viewMode}
						searchQuery={searchQuery}
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</div>
			</section>

			<FilterSheet
				open={isFilterSheetOpen}
				onOpenChange={setFilterSheetOpen}
				activeType={activeTab}
				activeCategory={activeCategory}
				filterVille={filterVille}
				filterCommune={filterCommune}
				dateFilter={dateFilter}
				dateRange={dateRange}
				hasActiveFilters={hasActiveFilters}
				resultCount={total}
				onTypeChange={setActiveTab}
				onCategoryChange={setActiveCategory}
				onVilleChange={setFilterVille}
				onCommuneChange={setFilterCommune}
				onDateFilterChange={setDateFilter}
				onDateRangeChange={setDateRange}
				onReset={resetFilters}
				onCancel={cancelFilters}
			/>
		</main>
	)
}
