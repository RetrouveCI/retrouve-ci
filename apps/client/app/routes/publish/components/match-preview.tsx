import { Link } from 'react-router'
import { ChevronRight, Search, WifiOff } from 'lucide-react'
import { imageUrl } from '@/shared/utils/image'
import type { LostItem, LostItemType } from '@/shared/types/lost-item'
import { categoryIcon } from '../../posts/posts.const'
import { useMatchingSuggestions } from '../hooks/use-matching-suggestions'

function MatchRow({ item }: { item: LostItem }) {
	const CategoryIcon = categoryIcon(item.category)

	return (
		<Link
			to={`/posts/${item.id}`}
			target="_blank"
			rel="noreferrer"
			className="border-border bg-background hover:border-foreground/20 flex items-center gap-3 rounded-xl border p-2.5 transition-colors"
		>
			<div className="bg-muted relative h-13.5 w-13.5 shrink-0 overflow-hidden rounded-[10px]">
				{item.image ? (
					<img
						src={imageUrl(item.image, { width: 200 })}
						alt=""
						loading="lazy"
						decoding="async"
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<CategoryIcon className="text-muted-foreground/40 h-5.5 w-5.5" />
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="line-clamp-1 text-[13.5px] font-semibold">{item.title}</p>
				<p className="text-muted-foreground mt-0.5 truncate text-[11.5px]">
					{item.location} · {item.date}
				</p>
			</div>

			<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
		</Link>
	)
}

interface MatchPreviewProps {
	type: LostItemType
	objectType: string
	ville: string
}

/**
 * The product's whole argument, moved above the fold: an object matching the
 * description may already be waiting, and the poster deserves to know before
 * writing an ad rather than after. Step 2 is the earliest point it can be
 * asked — the category and the city are exactly what the search needs.
 */
export function MatchPreview({ type, objectType, ville }: MatchPreviewProps) {
	const { matches, isLoading, hasFailed } = useMatchingSuggestions({
		objectType,
		ville,
		formType: type === 'lost' ? 'perdu' : 'retrouve',
	})

	if (!objectType || !ville) return null

	if (isLoading) {
		return (
			<div className="border-border rounded-2xl border p-4" role="status">
				<span className="sr-only">Recherche de correspondances…</span>
				{[0, 1].map(row => (
					<div key={row} className="flex items-center gap-3 py-2">
						<div className="bg-muted h-13.5 w-13.5 shrink-0 animate-pulse rounded-[10px]" />
						<div className="flex-1 space-y-2">
							<div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
							<div className="bg-muted h-2.5 w-1/2 animate-pulse rounded" />
						</div>
					</div>
				))}
			</div>
		)
	}

	if (hasFailed) {
		return (
			<p
				role="status"
				className="text-muted-foreground border-border flex items-start gap-2.5 rounded-2xl border p-4 text-[13px]"
			>
				<WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
				Impossible de vérifier les correspondances pour le moment. Vous pouvez
				publier votre annonce sans attendre.
			</p>
		)
	}

	if (matches.length === 0) {
		return (
			<p className="text-muted-foreground border-border rounded-2xl border p-4 text-[13px]">
				Aucun objet déjà {type === 'lost' ? 'trouvé' : 'perdu'} ne correspond
				pour l&apos;instant. Votre annonce sera la première.
			</p>
		)
	}

	// Spelled out rather than assembled from a plural flag: the verb agrees with
	// the count and the participle with the noun, which no single « s » covers.
	const found = type === 'lost' ? 'trouvé' : 'perdu'
	const headline =
		matches.length > 1
			? `${matches.length} objets déjà ${found}s vous ressemblent`
			: `1 objet déjà ${found} vous ressemble`

	return (
		<div className="border-primary-green/30 bg-primary-green/8 flex flex-col gap-3.5 rounded-2xl border-[1.5px] p-4">
			<div className="flex items-center gap-2.5">
				<span className="bg-primary-green flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full">
					<Search className="h-4 w-4 text-white" />
				</span>
				<div className="min-w-0">
					<p className="text-[14.5px] leading-tight font-bold">{headline}</p>
					<p className="text-muted-foreground mt-0.5 text-xs">
						Vérifiez avant de publier — vous gagnerez du temps.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-2.5">
				{matches.map(item => (
					<MatchRow key={item.id} item={item} />
				))}
			</div>
		</div>
	)
}
