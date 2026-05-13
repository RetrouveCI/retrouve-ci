import { Button, Badge, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { BentoCard } from '@/components/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
	id: number
	title: string
	type: 'lost' | 'found'
	status: 'published' | 'pending' | 'hidden'
	createdAt: string
}

export function PostsTab({ posts }: { posts: Post[] }) {
	return (
		<BentoCard variant="table">
			<CardContent className="pt-6">
				{posts.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Titre</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{posts.map(post => (
								<TableRow key={post.id} className="hover:bg-muted/50">
									<TableCell className="font-medium">{post.title}</TableCell>
									<TableCell>
										<Badge
											className={
												post.type === 'lost'
													? 'bg-red-100 text-red-700 hover:bg-red-100'
													: 'bg-green-100 text-green-700 hover:bg-green-100'
											}
										>
											{post.type === 'lost' ? 'Perdu' : 'Retrouvé'}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											className={
												post.status === 'published'
													? 'bg-green-100 text-green-700 hover:bg-green-100'
													: post.status === 'pending'
														? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
											}
										>
											{post.status === 'published'
												? 'Publié'
												: post.status === 'pending'
													? 'En attente'
													: 'Masqué'}
										</Badge>
									</TableCell>
									<TableCell>
										{format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}
									</TableCell>
									<TableCell className="text-right">
										<Button variant="ghost" size="sm" asChild>
											<Link href={`/posts/${post.id}`}>Voir</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="bg-muted rounded-full p-4">
							<FileText className="text-muted-foreground h-8 w-8" />
						</div>
						<p className="mt-4 font-medium">Aucun post</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Cet utilisateur n&apos;a pas encore créé de posts
						</p>
					</div>
				)}
			</CardContent>
		</BentoCard>
	)
}
