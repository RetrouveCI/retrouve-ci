import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@app/ui/components'
import { Link } from 'react-router'
import { ChevronRight, Package } from 'lucide-react'
import type { LostItem } from '@/shared/types/lost-item'
import { imageUrl } from '@/shared/utils/image'
import { buildMatchesTitle } from '../helpers/listing-matches'
import type { ListingMatches } from '../types/matches'

interface MatchesSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	matches: ListingMatches
	type: LostItem['type']
}

/**
 * The band names a number; this is what the number is. Listing the candidates
 * is the only honest destination — a filtered `/posts` query cannot reproduce
 * the score that selected them, so it would answer with a different set.
 */
export function MatchesSheet({
	open,
	onOpenChange,
	matches,
	type,
}: MatchesSheetProps) {
	const hidden = matches.count - matches.items.length

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<DrawerHeader className="border-b px-4 pt-2 pb-3.5 text-left">
					<DrawerTitle className="text-[17px] tracking-tight">
						{buildMatchesTitle(matches.count, type)}
					</DrawerTitle>
					<DrawerDescription className="text-xs">
						Ouvrez une annonce pour contacter la personne qui l&apos;a publiée.
					</DrawerDescription>
				</DrawerHeader>

				<div
					className="flex flex-col gap-1 px-3 py-3"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)',
					}}
				>
					{matches.items.map(item => (
						<Link
							key={item.id}
							to={`/posts/${item.id}`}
							className="hover:bg-muted flex min-h-13 items-center gap-3 rounded-xl px-3 py-2 transition-colors"
							onClick={() => onOpenChange(false)}
						>
							<span className="bg-muted relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
								{item.image ? (
									<img
										src={imageUrl(item.image, { width: 96 })}
										alt=""
										loading="lazy"
										decoding="async"
										className="absolute inset-0 h-full w-full object-cover"
									/>
								) : (
									<span className="flex h-full w-full items-center justify-center">
										<Package className="text-muted-foreground/40 h-4.5 w-4.5" />
									</span>
								)}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-[15px] font-medium">
									{item.title}
								</span>
								<span className="text-muted-foreground block truncate text-xs">
									{item.location} &middot; {item.date.toLowerCase()}
								</span>
							</span>
							<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
						</Link>
					))}

					{hidden > 0 && (
						<p className="text-muted-foreground px-3 pt-2 text-xs">
							Les {matches.items.length} plus proches sont affichés.
						</p>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	)
}
