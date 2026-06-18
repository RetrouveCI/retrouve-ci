import { Input } from '@retrouve-ci/ui/components'
import { Search, X, TrendingUp } from 'lucide-react'

interface PostsHeroProps {
	searchQuery: string
	onSearchChange: (value: string) => void
	listingsCount: number
	lostCount: number
	foundCount: number
	cityCount: number
}

export function PostsHero({
	searchQuery,
	onSearchChange,
	listingsCount,
	lostCount,
	foundCount,
	cityCount,
}: PostsHeroProps) {
	const stats = [
		{ label: 'Objets perdus', value: lostCount },
		{ label: 'Objets retrouvés', value: foundCount },
		{ label: 'Villes couvertes', value: cityCount },
	]
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

					<div className="relative mx-auto max-w-xl">
						<div className="bg-background focus-within:border-primary-green/50 flex items-center gap-2 rounded-2xl border-2 px-4 shadow-sm transition-all">
							<Search className="text-muted-foreground h-4 w-4 shrink-0" />
							<Input
								type="search"
								placeholder="Rechercher par objet, lieu..."
								value={searchQuery}
								onChange={e => onSearchChange(e.target.value)}
								className="h-12 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 md:text-base"
							/>
							{searchQuery && (
								<button
									onClick={() => onSearchChange('')}
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

			<div className="bg-muted/30 border-t">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-center divide-x">
						{stats.map(s => (
							<div
								key={s.label}
								className="flex flex-col items-center px-8 py-3"
							>
								<span className="text-lg font-bold">{s.value}</span>
								<span className="text-muted-foreground text-xs">{s.label}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
