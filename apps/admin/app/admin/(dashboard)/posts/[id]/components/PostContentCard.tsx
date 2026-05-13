import { Badge, Card, CardContent } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { MapPin, Calendar, User, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
	title: string
	type: 'lost' | 'found'
	description: string
	location: string
	date: string
	authorId: number
	authorName: string
	image?: string
}

export function PostContentCard({ post }: { post: Post }) {
	return (
		<Card>
			<CardContent className="p-0">
				{post.image ? (
					<img
						src={post.image}
						alt={post.title}
						className="h-64 w-full rounded-t-lg object-cover"
					/>
				) : (
					<div className="bg-muted flex h-64 w-full flex-col items-center justify-center rounded-t-lg">
						<ImageIcon className="text-muted-foreground h-12 w-12" />
						<p className="text-muted-foreground mt-2 text-sm">
							Aucune image disponible
						</p>
					</div>
				)}
				<div className="p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 className="text-2xl font-bold">{post.title}</h2>
							<Badge
								className={`mt-2 ${
									post.type === 'lost'
										? 'bg-red-100 text-red-700 hover:bg-red-100'
										: 'bg-green-100 text-green-700 hover:bg-green-100'
								}`}
							>
								{post.type === 'lost' ? 'Perdu' : 'Retrouvé'}
							</Badge>
						</div>
					</div>

					<p className="text-muted-foreground mt-4 whitespace-pre-wrap">
						{post.description}
					</p>

					<div className="mt-6 space-y-3">
						<div className="flex items-center gap-3 text-sm">
							<MapPin className="text-muted-foreground h-4 w-4" />
							<span>{post.location}</span>
						</div>
						<div className="flex items-center gap-3 text-sm">
							<Calendar className="text-muted-foreground h-4 w-4" />
							<span>
								{format(new Date(post.date), 'dd MMMM yyyy', { locale: fr })}
							</span>
						</div>
						<div className="flex items-center gap-3 text-sm">
							<User className="text-muted-foreground h-4 w-4" />
							<Link
								href={`/admin/users/${post.authorId}`}
								className="text-primary hover:underline"
							>
								{post.authorName}
							</Link>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
