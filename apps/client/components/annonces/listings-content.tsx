import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { ListingCard } from '@/components/listing-card'
import { cn } from '@retrouve-ci/ui/lib/utils'
import type { Listing } from '@/domain/entities/listing'

interface ListingsContentProps {
	paginatedListings: Listing[]
	filteredCount: number
	viewMode: 'grid' | 'list'
	searchQuery: string
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export function ListingsContent({
	paginatedListings,
	filteredCount,
	viewMode,
	searchQuery,
	currentPage,
	totalPages,
	onPageChange,
}: ListingsContentProps) {
	if (paginatedListings.length === 0) {
		return (
			<div className="bg-muted/10 rounded-2xl border-2 border-dashed py-24 text-center">
				<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
					<Inbox className="text-muted-foreground/50 h-8 w-8" />
				</div>
				<h3 className="mb-1 text-base font-semibold">Aucune annonce trouvée</h3>
				<p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
					{searchQuery
						? `Aucun résultat pour "${searchQuery}".`
						: 'Soyez le premier à publier dans cette catégorie.'}
				</p>
				<Button
					asChild
					className="rounded-xl bg-(--primary-green) text-white hover:bg-(--primary-green-dark)"
				>
					<a href="/publier">Publier une annonce</a>
				</Button>
			</div>
		)
	}

	return (
		<>
			<p className="text-muted-foreground mb-4 text-xs">
				<span className="text-foreground font-semibold">{filteredCount}</span>{' '}
				résultat{filteredCount > 1 ? 's' : ''}
				{searchQuery && (
					<>
						{' '}
						pour <span className="font-medium">&quot;{searchQuery}&quot;</span>
					</>
				)}
			</p>

			{viewMode === 'grid' ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{paginatedListings.map(listing => (
						<ListingCard key={listing.id} listing={listing} variant="grid" />
					))}
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{paginatedListings.map(listing => (
						<ListingCard key={listing.id} listing={listing} variant="list" />
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-10 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="h-10 w-10 rounded-xl"
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						aria-label="Page précédente"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
							<button
								key={page}
								onClick={() => onPageChange(page)}
								className={cn(
									'h-10 w-10 rounded-xl text-sm font-medium transition-all',
									page === currentPage
										? 'bg-(--primary-green) text-white shadow-sm'
										: 'hover:bg-muted text-muted-foreground',
								)}
								aria-current={page === currentPage ? 'page' : undefined}
							>
								{page}
							</button>
						))}
					</div>
					<Button
						variant="outline"
						size="icon"
						className="h-10 w-10 rounded-xl"
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						aria-label="Page suivante"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</>
	)
}
