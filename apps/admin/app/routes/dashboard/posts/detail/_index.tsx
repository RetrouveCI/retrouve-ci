import { Link } from 'react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'
import { Badge, Button } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import { PostThread } from '../components/post-thread'
import { CATEGORY_LABELS, MODERATION_CONFIG } from '../posts.const'
import { postsAction } from '../servers/posts.action'
import { PostModerationCard } from './components/post-moderation-card'
import { PostSummaryCard } from './components/post-summary-card'
import { postLoader } from './servers/post.loader'
import type { Route } from './+types/_index'

export const loader = postLoader
// The list's own action: it reads the listing's id from the form.
export const action = postsAction

export const handle: RouteHandle = {
	title: data =>
		(data as Route.ComponentProps['loaderData'] | undefined)?.post?.title ??
		'Annonce',
	breadcrumb: [{ label: 'Annonces', to: '/posts' }],
}

export default function PostDetailPage({ loaderData }: Route.ComponentProps) {
	const { post } = loaderData
	const moderation = MODERATION_CONFIG[post.moderationStatus]
	const isLost = post.type === 'lost'

	return (
		<div className="space-y-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<Badge
					className={cn(
						'border-0',
						isLost ? STATUS_TONE_CLASSES.danger : STATUS_TONE_CLASSES.success,
					)}
				>
					{isLost ? 'Perdu' : 'Retrouvé'}
				</Badge>
				<Badge className={moderation.className}>{moderation.label}</Badge>
				<Badge variant="outline">
					{CATEGORY_LABELS[post.category] ?? post.category}
				</Badge>
				{post.official && (
					<Badge className={STATUS_TONE_CLASSES.success}>
						Équipe RetrouveCI
					</Badge>
				)}
				{post.resolutionStatus === 'resolved' && (
					<Badge className={STATUS_TONE_CLASSES.info}>Résolu</Badge>
				)}
				<span className="text-muted-foreground">
					Publiée le{' '}
					{format(new Date(post.createdAt), "d MMM yyyy 'à' HH:mm", {
						locale: fr,
					})}
				</span>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<PostSummaryCard post={post} />
					<PostThread post={post} />
				</div>
				<div className="space-y-4">
					<PostModerationCard post={post} />
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center">
			<AlertTriangle className="text-muted-foreground h-12 w-12" />
			<h2 className="mt-4 text-xl font-semibold">Annonce introuvable</h2>
			<p className="text-muted-foreground mt-2">
				Cette annonce n’existe pas, ou l’API ne répond pas.
			</p>
			<Button asChild className="mt-4">
				<Link to="/posts">Retour aux annonces</Link>
			</Button>
		</div>
	)
}
