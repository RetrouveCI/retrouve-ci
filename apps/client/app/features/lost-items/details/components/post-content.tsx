import { Button } from '@retrouve-ci/ui/components'
import { MapPin, Calendar, Tag, Share2, Flag } from 'lucide-react'
import { PostGallery } from './post-gallery'

interface LostItem {
	title: string
	description: string
	location: string
	date: string
	type: 'lost' | 'found'
	category: string
	images?: string[]
}

export function PostContent({ listing }: { listing: LostItem }) {
	const isLost = listing.type === 'lost'

	return (
		<div className="space-y-6 lg:col-span-3">
			<PostGallery
				images={listing.images ?? []}
				title={listing.title}
				isLost={isLost}
			/>

			<div>
				<h1 className="mb-4 text-2xl font-bold md:text-3xl">{listing.title}</h1>

				<div className="mb-6 flex flex-wrap gap-4">
					<div className="text-muted-foreground flex items-center gap-2">
						<MapPin className="text-primary-green h-4 w-4" />
						<span>{listing.location}</span>
					</div>
					<div className="text-muted-foreground flex items-center gap-2">
						<Calendar className="text-primary-green h-4 w-4" />
						<span>{listing.date}</span>
					</div>
					<div className="text-muted-foreground flex items-center gap-2">
						<Tag className="text-primary-green h-4 w-4" />
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
