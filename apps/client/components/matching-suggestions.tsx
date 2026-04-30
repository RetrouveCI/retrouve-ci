'use client'

import Link from 'next/link'
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
	AlertCircle,
	CheckCircle,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/lib/utils'
import { useMatchingSuggestions } from '@/application/listings/use-matching-suggestions'
import type { ListingCategory } from '@/domain/entities/listing'

const CATEGORY_ICONS: Record<ListingCategory | string, React.ElementType> = {
	phones: Smartphone,
	keys: Key,
	wallets: Wallet,
	bags: Briefcase,
	electronics: Laptop,
	other: Package,
}

interface MatchingSuggestionsProps {
	objectType: string
	ville: string
	commune: string
	formType: 'perdu' | 'retrouve'
}

export function MatchingSuggestions({
	objectType,
	ville,
	commune,
	formType,
}: MatchingSuggestionsProps) {
	const matches = useMatchingSuggestions({ objectType, ville, commune, formType })

	const accentColor =
		formType === 'perdu' ? 'var(--accent-orange)' : 'var(--primary-green)'
	const TypeIcon = formType === 'perdu' ? CheckCircle : AlertCircle

	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			{/* Header */}
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
						{matches.length > 0
							? `${matches.length} correspondance${matches.length > 1 ? 's' : ''} trouvée${matches.length > 1 ? 's' : ''}`
							: 'Aucune correspondance pour le moment'}
					</p>
				</div>
				<TypeIcon
					className="h-4 w-4 shrink-0 opacity-50"
					style={{ color: accentColor }}
				/>
			</div>

			{/* Results */}
			{matches.length === 0 ? (
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
									href={`/annonces/${item.id}`}
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
													? 'text-[var(--primary-green)]'
													: 'text-red-500',
											)}
										/>
									</div>

									<div className="min-w-0 flex-1">
										<p className="line-clamp-1 text-sm leading-tight font-medium transition-colors group-hover:text-[var(--primary-green)]">
											{item.title}
										</p>
										<div className="mt-0.5 flex items-center gap-2">
											<span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
												<MapPin className="h-3 w-3 shrink-0" />
												<span className="max-w-[90px] truncate">
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

			{/* Footer CTA */}
			<div className="bg-muted/20 border-t px-4 py-3">
				<Link
					href="/annonces"
					className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
				>
					Voir toutes les annonces
					<ArrowRight className="h-3 w-3" />
				</Link>
			</div>
		</div>
	)
}
