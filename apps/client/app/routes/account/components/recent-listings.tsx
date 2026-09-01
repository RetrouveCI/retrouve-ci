import { Link } from 'react-router'
import {
	Eye,
	MessageCircle,
	MapPin,
	Package,
	ArrowRight,
	Plus,
	FileText,
} from 'lucide-react'
import { Badge } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import type { UserLostItem } from '@/shared/types/lost-item'
import { imageUrl } from '@/shared/utils/image'
import { listingStatusFor } from '@/routes/account/posts/helpers/listing-status'

interface RecentListingsProps {
	listings: UserLostItem[]
	className?: string
}

export function RecentListings({ listings, className }: RecentListingsProps) {
	const recent = [...listings]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 4)

	return (
		<div
			className={cn(
				'bg-background border-border/50 h-fit rounded-2xl border',
				className,
			)}
		>
			<div className="flex items-center justify-between border-b px-5 py-4">
				<div className="flex items-center gap-2">
					<FileText className="text-primary-green-text h-5 w-5" />
					<h2 className="font-bold">Mes annonces récentes</h2>
				</div>
				{listings.length > 0 && (
					<Link
						to="/account/posts"
						className="text-primary-green-text inline-flex items-center gap-1 text-sm font-medium hover:underline"
					>
						Voir tout
						<ArrowRight className="h-3.5 w-3.5" />
					</Link>
				)}
			</div>

			{recent.length === 0 ? (
				<div className="flex flex-col items-center justify-center px-6 py-14 text-center">
					<div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
						<Package className="text-muted-foreground/50 h-7 w-7" />
					</div>
					<h3 className="mb-1 font-semibold">Aucune annonce pour le moment</h3>
					<p className="text-muted-foreground mb-5 max-w-xs text-sm">
						Publiez votre première annonce pour un objet perdu ou retrouvé.
					</p>
					<Link
						to="/publish"
						className="bg-foreground text-background inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
					>
						<Plus className="h-4 w-4" />
						Publier une annonce
					</Link>
				</div>
			) : (
				<div className="divide-y">
					{recent.map(listing => {
						const status = listingStatusFor(listing)
						return (
							<Link
								key={listing.id}
								to={`/posts/${listing.id}`}
								className="hover:bg-muted/40 flex items-center gap-4 px-5 py-4 transition-colors"
							>
								<div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
									{listing.image ? (
										<img
											src={imageUrl(listing.image, { width: 112 })}
											alt={listing.title}
											loading="lazy"
											decoding="async"
											className="absolute inset-0 h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<Package className="text-muted-foreground/30 h-6 w-6" />
										</div>
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										{status.label && (
											<Badge
												className={cn('text-[10px] font-medium', status.badge)}
											>
												{status.label}
											</Badge>
										)}
										<span
											className={cn(
												'text-[10px] font-medium',
												listing.type === 'lost'
													? 'text-red-500'
													: 'text-primary-green-text',
											)}
										>
											{listing.type === 'lost' ? 'Perdu' : 'Trouvé'}
										</span>
									</div>
									<h4 className="truncate text-sm font-semibold">
										{listing.title}
									</h4>
									<p className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
										<MapPin className="h-3 w-3 shrink-0" />
										{listing.location}
									</p>
								</div>
								<div className="text-muted-foreground hidden shrink-0 items-center gap-3 text-xs sm:flex">
									<span className="flex items-center gap-1">
										<Eye className="h-3.5 w-3.5" />
										{listing.views}
									</span>
									<span className="flex items-center gap-1">
										<MessageCircle className="h-3.5 w-3.5" />
										{listing.contacts}
									</span>
								</div>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
