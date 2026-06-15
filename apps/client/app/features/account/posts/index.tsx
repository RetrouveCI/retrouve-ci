import { Button, Input } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { FileText, Plus, ArrowLeft, Search } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { useState, useMemo } from 'react'
import { ListingCard } from './components/listing-card'
import { accountPostsLoader } from './servers/account-posts.loader'
import { accountPostsAction } from './servers/account-posts.action'
import type { Route } from './+types/index'

export const loader = accountPostsLoader

export const action = accountPostsAction

export default function AnnoncesPage({ loaderData }: Route.ComponentProps) {
	const { listings } = loaderData
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

	const filteredListings = useMemo(() => {
		return listings.filter(l => {
			const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase())
			const matchesFilter = filter === 'all' || l.status === filter
			return matchesSearch && matchesFilter
		})
	}, [listings, search, filter])

	const activeCount = listings.filter(l => l.status === 'active').length
	const resolvedCount = listings.filter(l => l.status === 'resolved').length

	return (
		<main className="flex-1">
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="bg-accent-orange/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="bg-accent-orange/10 flex h-14 w-14 items-center justify-center rounded-2xl">
								<FileText className="text-accent-orange h-7 w-7" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">Mes Annonces</h1>
								<p className="text-muted-foreground">
									{listings.length} annonce{listings.length > 1 ? 's' : ''} ·{' '}
									{activeCount} active{activeCount > 1 ? 's' : ''}
								</p>
							</div>
						</div>
						<Button
							asChild
							className="bg-accent-orange hover:bg-accent-orange-dark gap-2 rounded-xl text-white"
						>
							<Link to="/publish">
								<Plus className="h-4 w-4" />
								Nouvelle annonce
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className="border-b py-4">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
						<div className="relative max-w-xs flex-1">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Rechercher..."
								value={search}
								onChange={e => setSearch(e.target.value)}
								className="h-10 rounded-xl pl-9"
							/>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setFilter('all')}
								className={cn(
									'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
									filter === 'all'
										? 'bg-foreground text-background'
										: 'bg-muted text-muted-foreground hover:bg-muted/80',
								)}
							>
								Toutes ({listings.length})
							</button>
							<button
								onClick={() => setFilter('active')}
								className={cn(
									'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
									filter === 'active'
										? 'bg-primary-green text-white'
										: 'bg-muted text-muted-foreground hover:bg-muted/80',
								)}
							>
								Actives ({activeCount})
							</button>
							<button
								onClick={() => setFilter('resolved')}
								className={cn(
									'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
									filter === 'resolved'
										? 'bg-blue-500 text-white'
										: 'bg-muted text-muted-foreground hover:bg-muted/80',
								)}
							>
								Résolues ({resolvedCount})
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="py-8">
				<div className="container mx-auto px-4">
					{filteredListings.length > 0 ? (
						<div className="grid gap-4 lg:grid-cols-2">
							{filteredListings.map(listing => (
								<ListingCard key={listing.id} listing={listing} />
							))}
						</div>
					) : listings.length > 0 ? (
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
								className="bg-accent-orange hover:bg-accent-orange-dark gap-2 rounded-xl text-white"
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
		</main>
	)
}
