import { TrendingUp } from 'lucide-react'
import { SearchBar } from '@/shared/components/search-bar'

interface PostsHeroProps {
	searchQuery: string
	onSearchChange: (value: string) => void
	listingsCount: number
}

export function PostsHero({
	searchQuery,
	onSearchChange,
	listingsCount,
}: PostsHeroProps) {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary-green/5 absolute -top-40 -right-40 h-150 w-150 rounded-full blur-3xl" />
				<div className="bg-accent-orange/5 absolute -bottom-20 -left-20 h-80 w-80 rounded-full blur-3xl" />
			</div>

			<div className="relative container mx-auto px-4 pt-12 pb-8">
				<div className="mx-auto max-w-2xl text-center">
					<div className="border-primary-green/20 bg-primary-green/10 text-primary-green mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
						<TrendingUp className="h-3.5 w-3.5" />
						{listingsCount} annonces disponibles
					</div>
					<h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
						Objets <span className="text-primary-green">Perdus</span> &amp;{' '}
						<span className="text-accent-orange">Retrouvés</span>
					</h1>
					<p className="text-muted-foreground mb-8 text-base md:text-lg">
						Retrouvez votre objet ou aidez quelqu&apos;un à récupérer le sien.
					</p>

					<div className="mx-auto max-w-xl">
						<SearchBar
							mode="filter"
							size="lg"
							value={searchQuery}
							onChange={onSearchChange}
							className="shadow-sm"
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
