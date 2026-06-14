import { Link } from 'react-router'
import {
	MapPin,
	Clock,
	ArrowRight,
	Package,
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { LostItem } from '@/shared/types/lost-item'

interface ListingCardProps {
	listing: LostItem
	variant?: 'grid' | 'list'
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	phones: Smartphone,
	keys: Key,
	wallets: Wallet,
	bags: Briefcase,
	electronics: Laptop,
	other: Package,
}

const CATEGORY_LABELS: Record<string, string> = {
	phones: 'Téléphone',
	keys: 'Clés',
	wallets: 'Portefeuille',
	bags: 'Sac',
	electronics: 'Électronique',
	other: 'Autre',
}

function ListingThumbnail({
	listing,
	CategoryIcon,
}: {
	listing: LostItem
	CategoryIcon: React.ElementType
}) {
	return (
		<div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
			{listing.image ? (
				<img
					src={listing.image}
					alt={listing.title}
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
				/>
			) : (
				<div className="bg-muted absolute inset-0 flex items-center justify-center">
					<CategoryIcon className="text-muted-foreground/40 h-8 w-8" />
				</div>
			)}
		</div>
	)
}

function ListingImage({
	listing,
	CategoryIcon,
	isLost,
}: {
	listing: LostItem
	CategoryIcon: React.ElementType
	isLost: boolean
}) {
	return (
		<div className="bg-muted relative aspect-[16/9] shrink-0 overflow-hidden">
			{listing.image ? (
				<img
					src={listing.image}
					alt={listing.title}
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			) : (
				<div className="from-muted to-muted/70 absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br">
					<CategoryIcon className="text-muted-foreground/25 h-10 w-10" />
					<span className="text-muted-foreground/50 text-[10px] font-medium tracking-widest uppercase">
						{CATEGORY_LABELS[listing.category] ?? 'Objet'}
					</span>
				</div>
			)}

			<div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			<div
				className={cn(
					'absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm',
					isLost ? 'bg-red-500 text-white' : 'bg-primary-green text-white',
				)}
			>
				<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
				{isLost ? 'Perdu' : 'Retrouvé'}
			</div>

			<div className="bg-background/90 text-muted-foreground absolute top-3 right-3 flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm">
				<CategoryIcon className="h-3 w-3" />
				{CATEGORY_LABELS[listing.category] ?? 'Autre'}
			</div>
		</div>
	)
}

export function ListingCard({ listing, variant = 'grid' }: ListingCardProps) {
	const isLost = listing.type === 'lost'
	const CategoryIcon = CATEGORY_ICONS[listing.category] ?? Package

	if (variant === 'list') {
		return (
			<Link to={`/posts/${listing.id}`} className="group block">
				<article className="bg-background hover:border-primary-green/30 flex gap-3 rounded-2xl border p-3 transition-all duration-200 hover:shadow-md">
					<ListingThumbnail listing={listing} CategoryIcon={CategoryIcon} />

					<div className="flex min-w-0 flex-1 flex-col justify-between">
						<div>
							<div className="mb-1 flex items-start justify-between gap-2">
								<h3 className="group-hover:text-primary-green line-clamp-1 text-sm leading-snug font-semibold transition-colors">
									{listing.title}
								</h3>
								<span
									className={cn(
										'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
										isLost
											? 'bg-red-50 text-red-600'
											: 'text-primary-green bg-green-50',
									)}
								>
									{isLost ? 'Perdu' : 'Retrouvé'}
								</span>
							</div>
							<p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
								{listing.description}
							</p>
						</div>
						<div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
							<span className="flex items-center gap-1">
								<MapPin className="h-3 w-3 shrink-0" />
								<span className="max-w-[140px] truncate">
									{listing.location}
								</span>
							</span>
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3 shrink-0" />
								{listing.date}
							</span>
							<span className="text-primary-green ml-auto flex items-center gap-1 font-medium opacity-0 transition-opacity group-hover:opacity-100">
								Voir <ArrowRight className="h-3 w-3" />
							</span>
						</div>
					</div>
				</article>
			</Link>
		)
	}

	return (
		<Link to={`/posts/${listing.id}`} className="group block h-full">
			<article className="bg-background hover:border-primary-green/30 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
				<ListingImage
					listing={listing}
					CategoryIcon={CategoryIcon}
					isLost={isLost}
				/>

				<div className="flex flex-1 flex-col p-3">
					<h3 className="group-hover:text-primary-green mb-1 line-clamp-1 text-sm leading-snug font-semibold transition-colors">
						{listing.title}
					</h3>
					<p className="text-muted-foreground mb-2.5 line-clamp-2 flex-1 text-xs leading-relaxed">
						{listing.description}
					</p>

					<div className="flex items-center justify-between border-t pt-2.5">
						<div className="flex flex-col gap-0.5">
							<span className="text-muted-foreground flex items-center gap-1 text-[11px]">
								<MapPin className="h-3 w-3 shrink-0" />
								<span className="max-w-[110px] truncate">
									{listing.location}
								</span>
							</span>
							<span className="text-muted-foreground flex items-center gap-1 text-[11px]">
								<Clock className="h-3 w-3 shrink-0" />
								{listing.date}
							</span>
						</div>
						<span className="text-primary-green flex translate-x-0 items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5">
							Voir
							<ArrowRight className="h-3.5 w-3.5" />
						</span>
					</div>
				</div>
			</article>
		</Link>
	)
}
