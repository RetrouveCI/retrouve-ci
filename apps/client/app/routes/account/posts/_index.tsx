import { Button, Input } from '@app/ui/components'
import { Link, useLocation, useNavigation } from 'react-router'
import { FileText, Plus, ArrowLeft, Search, TriangleAlert } from 'lucide-react'
import { FilterPill } from '@/components/filter-pill'
import { PaginationBar } from '@/components/pagination-bar'
import { ListingCard } from './components/listing-card'
import { ListingCardSkeleton } from './components/listing-card-skeleton'
import { ModerationBanner } from './components/moderation-banner'
import { useAccountPostsFilters } from './hooks/use-account-posts-filters'
import { useListingMatches } from './hooks/use-listing-matches'
import { buildModerationNotice } from './helpers/moderation-notice'
import { LIFECYCLE_FILTERS } from './account-posts.const'
import { accountPostsLoader } from './servers/account-posts.loader'
import { accountPostsAction } from './servers/account-posts.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'
import { InstallPrompt } from '@/components/install-prompt'

export function meta() {
	return pageMeta({
		title: 'Mes annonces',
		description: 'Retrouvez et gérez les annonces que vous avez publiées.',
	})
}

export const loader = accountPostsLoader

export const action = accountPostsAction

export default function AnnoncesPage({ loaderData }: Route.ComponentProps) {
	const { listings, total, pageSize, summary } = loaderData

	const {
		searchQuery,
		setSearchQuery,
		status,
		setStatus,
		currentPage,
		setCurrentPage,
		hasActiveFilters,
		totalPages,
	} = useAccountPostsFilters({ total, pageSize })

	const navigation = useNavigation()
	const location = useLocation()
	// A filter or a page is a navigation to this very path: what changes is the
	// query string, so that is what the list waits on.
	const isLoading =
		navigation.state === 'loading' &&
		navigation.location.pathname === location.pathname

	const matches = useListingMatches(listings)
	const notice = buildModerationNotice(summary.moderation)
	const counts: Record<string, number> = {
		all: summary.total,
		...summary.lifecycle,
	}

	return (
		<main className="flex-1">
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="bg-accent-orange/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground touch-target mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="bg-accent-orange/10 flex h-14 w-14 items-center justify-center rounded-2xl">
								<FileText className="text-accent-orange-text h-7 w-7" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">Mes Annonces</h1>
								{/* `total` is what the API counted, never what the browser
								    worked out from a truncated page. */}
								<p className="text-muted-foreground">
									{hasActiveFilters
										? `${total} résultat${total > 1 ? 's' : ''}`
										: `${total} annonce${total > 1 ? 's' : ''}`}
								</p>
							</div>
						</div>
						<Button
							asChild
							className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark gap-2 rounded-xl"
						>
							<Link to="/publish">
								<Plus className="h-4 w-4" />
								Nouvelle annonce
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{notice && (
				<div className="container mx-auto px-4 pt-4">
					<ModerationBanner {...notice} />
				</div>
			)}

			<section className="border-b py-4">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
						<div className="relative max-w-xs flex-1">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Rechercher..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="h-10 rounded-xl pl-9"
								aria-label="Rechercher dans mes annonces"
							/>
						</div>
						<div
							className="flex flex-wrap items-center gap-2"
							role="group"
							aria-label="Cycle de vie de l'annonce"
						>
							{LIFECYCLE_FILTERS.map(({ id, label, activeClassName }) => (
								<FilterPill
									key={id}
									active={status === id}
									onClick={() => setStatus(id)}
									className={status === id ? activeClassName : undefined}
								>
									{label}
									{/* The count is what the API holds for that bucket, over every
									    listing — never over the page on screen. An empty account has
									    nothing to count, so it is not counted at four zeros. */}
									{summary.total > 0 && (
										<span className="tabular-nums opacity-70">
											<span aria-hidden>·</span> {counts[id] ?? 0}
										</span>
									)}
								</FilterPill>
							))}
						</div>
					</div>
				</div>
			</section>

			<section className="py-8">
				<div className="container mx-auto px-4">
					{isLoading ? (
						<div
							className="grid gap-4 lg:grid-cols-2"
							aria-busy="true"
							aria-label="Chargement des annonces"
						>
							{Array.from({ length: 4 }, (_, index) => (
								<ListingCardSkeleton key={index} />
							))}
						</div>
					) : listings.length > 0 ? (
						<>
							<div className="grid gap-4 lg:grid-cols-2">
								{listings.map(listing => (
									<ListingCard
										key={listing.id}
										listing={listing}
										matches={matches[listing.id]}
									/>
								))}
							</div>
							<PaginationBar
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
							/>
						</>
					) : hasActiveFilters ? (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-12 text-center">
							<Search className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
							<h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
							<p className="text-muted-foreground text-sm">
								Aucune annonce ne correspond à votre recherche.
							</p>
						</div>
					) : (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
							<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
								<FileText className="text-muted-foreground h-8 w-8" />
							</div>
							<h3 className="mb-2 text-lg font-semibold">Aucune annonce</h3>
							<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
								Vous n&apos;avez pas encore publié d&apos;annonce. Commencez
								maintenant !
							</p>
							<Button
								asChild
								className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark gap-2 rounded-xl"
							>
								<Link to="/publish">
									<Plus className="h-4 w-4" />
									Publier une annonce
								</Link>
							</Button>
						</div>
					)}
				</div>
			</section>

			<InstallPrompt after="published" />
		</main>
	)
}

/**
 * The fourth state of §2.3 rule 5. Without one the failure climbed to the root
 * boundary, which drops the whole shell for a bare « Une erreur est survenue »
 * and offers no way back.
 */
export function ErrorBoundary() {
	return (
		<main className="flex-1">
			<div className="container mx-auto px-4 py-16">
				<div className="bg-muted/30 mx-auto max-w-md rounded-2xl border-2 border-dashed py-12 text-center">
					<TriangleAlert className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
					<h1 className="mb-2 text-lg font-semibold">
						Impossible d&apos;afficher vos annonces
					</h1>
					<p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
						Le service est momentanément indisponible. Vos annonces, elles, sont
						intactes.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button
							onClick={() => window.location.reload()}
							className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
						>
							Réessayer
						</Button>
						<Button asChild variant="outline" className="rounded-xl">
							<Link to="/account">Retour au compte</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	)
}
