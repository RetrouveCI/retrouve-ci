import { Link } from 'react-router'
import { MapPin, Package, RefreshCw } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { imageUrl } from '@/shared/utils/image'
import type { LostItem } from '@/shared/types/lost-item'
import { categoryIcon } from '../../posts/posts.const'
import type { HomeRecentListings } from '../servers/home.loader'

function StripCard({ listing }: { listing: LostItem }) {
	const isLost = listing.type === 'lost'
	const CategoryIcon = categoryIcon(listing.category)

	return (
		<Link
			to={`/posts/${listing.id}`}
			className="group border-border bg-background hover:border-foreground/20 w-42 shrink-0 snap-start overflow-hidden rounded-[14px] border transition-colors sm:w-auto"
		>
			<div className="bg-muted relative h-27">
				{listing.image ? (
					<img
						src={imageUrl(listing.image, { width: 400 })}
						alt={listing.title}
						loading="lazy"
						decoding="async"
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<CategoryIcon className="text-muted-foreground/30 h-7.5 w-7.5" />
					</div>
				)}
				<span
					className={cn(
						'absolute top-2 left-2 flex h-5.5 items-center rounded-full px-2.5 text-xs font-bold tracking-[0.04em] uppercase',
						isLost ? 'bg-red-700 text-white' : 'bg-primary-green text-white',
					)}
				>
					{isLost ? 'Perdu' : 'Trouvé'}
				</span>
			</div>

			<div className="p-3">
				<p className="group-hover:text-primary-green-text line-clamp-2 text-sm leading-snug font-semibold transition-colors">
					{listing.title}
				</p>
				<p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
					<MapPin className="h-3 w-3 shrink-0" />
					<span className="truncate">
						{listing.ville} · {listing.date}
					</span>
				</p>
			</div>
		</Link>
	)
}

function StripNotice({
	icon: Icon,
	children,
}: {
	icon: React.ElementType
	children: React.ReactNode
}) {
	return (
		<div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-[14px] border border-dashed px-4 py-8 text-center text-sm">
			<Icon className="h-6 w-6 opacity-50" />
			{children}
		</div>
	)
}

export function RecentListingsStrip({
	recent,
}: {
	recent: HomeRecentListings | null
}) {
	return (
		<section className="border-border/60 border-t py-7">
			<div className="container mx-auto px-4">
				<div className="mb-3.5 flex items-baseline justify-between gap-4">
					<h2 className="text-lg font-bold tracking-tight md:text-xl lg:text-2xl">
						Signalés récemment
					</h2>
					<Link
						to="/posts"
						className="text-primary-green-text touch-target shrink-0 text-sm font-semibold md:text-sm"
					>
						{recent && recent.total > 0
							? `Voir les ${recent.total} annonces`
							: 'Tout voir'}
					</Link>
				</div>

				{recent === null ? (
					<StripNotice icon={RefreshCw}>
						Les annonces n&apos;ont pas pu être chargées.{' '}
						<Link to="/posts" className="text-primary-green-text font-semibold">
							Réessayer
						</Link>
					</StripNotice>
				) : recent.listings.length === 0 ? (
					<StripNotice icon={Package}>
						Aucune annonce pour l&apos;instant.{' '}
						<Link
							to="/publish/lost"
							className="text-primary-green-text font-semibold"
						>
							Publiez la première
						</Link>
					</StripNotice>
				) : (
					// Below `sm` the row scrolls (§2.1, secondary lists); above it, the
					// cards are a grid so nothing hides off-screen for good.
					<div className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3.5 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-5">
						{recent.listings.map(listing => (
							<StripCard key={listing.id} listing={listing} />
						))}
					</div>
				)}
			</div>
		</section>
	)
}
