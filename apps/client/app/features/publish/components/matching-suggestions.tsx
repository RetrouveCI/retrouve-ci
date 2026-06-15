import { Link } from 'react-router'
import {
	Sparkles,
	MapPin,
	Clock,
	ArrowRight,
	Package,
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
	Shirt,
	Gem,
	FileText,
	AlertCircle,
	CheckCircle,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { useMatchingSuggestions } from '../hooks/use-matching-suggestions'
import type { LostItemCategory } from '@/shared/types/lost-item'

const CATEGORY_ICONS: Record<LostItemCategory | string, React.ElementType> = {
	phone: Smartphone,
	keys: Key,
	wallet: Wallet,
	bag: Briefcase,
	electronics: Laptop,
	clothing: Shirt,
	jewelry: Gem,
	documents: FileText,
	other: Package,
}

interface MatchingSuggestionsProps {
	objectType: string
	ville: string
	formType: 'perdu' | 'retrouve'
}

export function MatchingSuggestions({
	objectType,
	ville,
	formType,
}: MatchingSuggestionsProps) {
	const { matches, isLoading } = useMatchingSuggestions({
		objectType,
		ville,
		formType,
	})

	const accentColor =
		formType === 'perdu' ? 'varaccent-orange' : 'varprimary-green'
	const TypeIcon = formType === 'perdu' ? CheckCircle : AlertCircle

	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div
				className="flex items-center gap-2.5 border-b px-4 py-3.5"
				style={{
					borderColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
					background: `color-mix(in srgb, ${accentColor} 5%, transparent)`,
				}}
			>
				<Sparkles className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
				<div className="min-w-0 flex-1">
					<p className="text-sm leading-tight font-semibold">
						{formType === 'perdu'
							? 'Objets similaires retrouvés'
							: 'Objets similaires perdus'}
					</p>
					<p className="text-muted-foreground mt-0.5 text-[11px]">
						{isLoading
							? 'Recherche en cours...'
							: matches.length > 0
								? `${matches.length} correspondance${matches.length > 1 ? 's' : ''} trouvée${matches.length > 1 ? 's' : ''}`
								: 'Aucune correspondance pour le moment'}
					</p>
				</div>
				<TypeIcon
					className="h-4 w-4 shrink-0 opacity-50"
					style={{ color: accentColor }}
				/>
			</div>

			{isLoading ? (
				<div className="space-y-3 px-4 py-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="bg-muted h-9 w-9 shrink-0 animate-pulse rounded-xl" />
							<div className="flex-1 space-y-1.5">
								<div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
								<div className="bg-muted h-2.5 w-1/2 animate-pulse rounded" />
							</div>
						</div>
					))}
				</div>
			) : matches.length === 0 ? (
				<div className="px-4 py-6 text-center">
					<div className="bg-muted mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl">
						<Package className="text-muted-foreground/40 h-5 w-5" />
					</div>
					<p className="text-muted-foreground text-sm">
						Aucun objet correspondant trouvé{ville ? ` à ${ville}` : ''}.
					</p>
					<p className="text-muted-foreground/70 mt-1 text-xs">
						Votre annonce sera la première !
					</p>
				</div>
			) : (
				<ul className="divide-y">
					{matches.map(item => {
						const Icon = CATEGORY_ICONS[item.category] ?? Package
						return (
							<li key={item.id}>
								<Link
									to={`/posts/${item.id}`}
									target="_blank"
									className="hover:bg-muted/40 group flex items-center gap-3 px-4 py-3 transition-colors"
								>
									<div
										className={cn(
											'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
											item.type === 'found' ? 'bg-green-50' : 'bg-red-50',
										)}
									>
										<Icon
											className={cn(
												'h-4 w-4',
												item.type === 'found'
													? 'text-primary-green'
													: 'text-red-500',
											)}
										/>
									</div>

									<div className="min-w-0 flex-1">
										<p className="group-hover:text-primary-green line-clamp-1 text-sm leading-tight font-medium transition-colors">
											{item.title}
										</p>
										<div className="mt-0.5 flex items-center gap-2">
											<span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
												<MapPin className="h-3 w-3 shrink-0" />
												<span className="max-w-22.5 truncate">
													{item.location}
												</span>
											</span>
											<span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
												<Clock className="h-3 w-3 shrink-0" />
												{item.date}
											</span>
										</div>
									</div>

									<ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
								</Link>
							</li>
						)
					})}
				</ul>
			)}

			<div className="bg-muted/20 border-t px-4 py-3">
				<Link
					to="/posts"
					className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
				>
					Voir toutes les annonces
					<ArrowRight className="h-3 w-3" />
				</Link>
			</div>
		</div>
	)
}
