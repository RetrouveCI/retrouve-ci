import Image from 'next/image'
import { Button, Badge } from '@retrouve-ci/ui/components'
import { MapPin, Calendar, Tag, Share2, Flag, Package } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface Listing {
	title: string
	description: string
	location: string
	date: string
	type: 'lost' | 'found'
	category: string
	image?: string
}

export function PostContent({ listing }: { listing: Listing }) {
	const isLost = listing.type === 'lost'

	return (
		<div className="space-y-6 lg:col-span-3">
			<div className="bg-muted relative aspect-4/3 overflow-hidden rounded-2xl">
				{listing.image ? (
					<Image
						src={listing.image}
						alt={listing.title}
						fill
						className="object-cover"
						priority
					/>
				) : (
					<div className="from-muted to-muted/50 absolute inset-0 flex items-center justify-center bg-linear-to-br">
						<Package className="text-muted-foreground/30 h-24 w-24" />
					</div>
				)}

				<Badge
					className={cn(
						'absolute top-4 left-4 px-3 py-1 text-sm',
						isLost
							? 'border-0 bg-accent-orange text-white'
							: 'border-0 bg-primary-green text-white',
					)}
				>
					{isLost ? 'Objet perdu' : 'Objet retrouvé'}
				</Badge>
			</div>

			<div>
				<h1 className="mb-4 text-2xl font-bold md:text-3xl">{listing.title}</h1>

				<div className="mb-6 flex flex-wrap gap-4">
					<div className="text-muted-foreground flex items-center gap-2">
						<MapPin className="h-4 w-4 text-primary-green" />
						<span>{listing.location}</span>
					</div>
					<div className="text-muted-foreground flex items-center gap-2">
						<Calendar className="h-4 w-4 text-primary-green" />
						<span>{listing.date}</span>
					</div>
					<div className="text-muted-foreground flex items-center gap-2">
						<Tag className="h-4 w-4 text-primary-green" />
						<span>{listing.category}</span>
					</div>
				</div>

				<div className="prose prose-gray max-w-none">
					<h2 className="mb-3 text-lg font-semibold">Description</h2>
					<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
						{listing.description}
					</p>
				</div>
			</div>

			<div className="flex gap-4">
				<Button variant="outline" size="sm" className="gap-2">
					<Share2 className="h-4 w-4" />
					Partager
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-destructive gap-2"
				>
					<Flag className="h-4 w-4" />
					Signaler
				</Button>
			</div>
		</div>
	)
}
