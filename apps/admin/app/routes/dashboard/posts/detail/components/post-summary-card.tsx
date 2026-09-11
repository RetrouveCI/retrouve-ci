import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
	CalendarDays,
	Eye,
	MapPin,
	MessageCircle,
	Phone,
	User,
	Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import { PostDocumentBlock } from '../../components/post-document-block'
import { PostPhotos } from '../../components/post-photos'
import type { Post } from '../../types/posts.types'

interface MetaItem {
	icon: typeof MapPin
	value: string
}

export function PostSummaryCard({ post }: { post: Post }) {
	const metaItems: MetaItem[] = [
		{
			icon: MapPin,
			value: `${post.ville}${post.commune ? ` · ${post.commune}` : ''}`,
		},
		{
			icon: CalendarDays,
			value: format(new Date(post.eventDate), 'dd MMM yyyy', { locale: fr }),
		},
		{ icon: User, value: post.contactName },
		{ icon: Phone, value: post.contactWhatsapp },
		{ icon: Eye, value: `${post.views} vues` },
		{ icon: MessageCircle, value: `${post.contactsCount} prises de contact` },
	]

	// The desk's own note: who the object is held for. Never on a public read.
	if (post.postedFor) {
		metaItems.push({ icon: Users, value: `Déposée pour ${post.postedFor}` })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{post.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<PostPhotos photos={post.photos} title={post.title} />

				{/* A described piece of ID needs no paragraph, so it may have none. */}
				{post.description && (
					<div className="bg-muted/40 rounded-xl border p-4">
						<p className="text-sm leading-relaxed whitespace-pre-line">
							{post.description}
						</p>
					</div>
				)}

				<PostDocumentBlock post={post} />

				<div className="grid gap-2.5 sm:grid-cols-2">
					{metaItems.map(({ icon: Icon, value }, i) => (
						<div
							key={i}
							className="bg-muted/30 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
						>
							<span className="bg-background text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
								<Icon className="h-4 w-4" />
							</span>
							<span className="truncate">{value}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
