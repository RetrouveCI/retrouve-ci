import { useState } from 'react'
import { Link } from 'react-router'
import type { FieldValues } from 'react-hook-form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@app/ui/components'
import { BentoCard } from '@/components/bento-card'
import { DataTable } from '@/components/data-table'
import { PostsFilters } from './components/posts-filters'
import { PostsStatsGrid } from './components/posts-stats-grid'
import {
	HidePostDialog,
	type HideDecision,
} from './components/hide-post-dialog'
import { postsLoader } from './servers/posts.loader'
import { postsAction } from './servers/posts.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
	MoreHorizontal,
	Eye,
	CheckCircle2,
	EyeOff,
	Clock,
	MapPin,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Post, ModerationStatus } from './types/posts.types'
import { CATEGORY_LABELS, MODERATION_CONFIG } from './posts.const'
import { unreadRepliesLabel } from './helpers/unread-replies'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = postsLoader
export const action = postsAction

export const handle: RouteHandle = { title: 'Annonces' }

export default function PostsPage({ loaderData }: Route.ComponentProps) {
	const { posts, total, page, pageSize, counts, unreadReplies } = loaderData

	const [hidingPost, setHidingPost] = useState<Post | null>(null)

	const moderateFetcher = useActionFetcher<
		typeof postsAction,
		FieldValues,
		Post
	>()

	useSettledSubmission(moderateFetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ?? 'Impossible de modérer cette annonce',
			)
			return
		}

		const post = result.data
		if (!post) return

		toast.success(
			`"${post.title}" — ${MODERATION_CONFIG[post.moderationStatus].label}`,
		)
	})

	const handleModerate = (
		id: string,
		moderationStatus: ModerationStatus,
		decision: HideDecision = {},
	) => {
		moderateFetcher.submit(
			{
				intent: 'moderate',
				id,
				moderationStatus,
				moderationReason: decision.moderationReason ?? '',
				moderationReasonNote: decision.moderationReasonNote ?? '',
			},
			{ method: 'post' },
		)
	}

	const handleHide = (decision: HideDecision) => {
		if (!hidingPost) return

		handleModerate(hidingPost.id, 'hidden', decision)
		setHidingPost(null)
	}

	const columns: ColumnDef<Post>[] = [
		{
			accessorKey: 'title',
			header: 'Titre',
			cell: ({ row }) => (
				<div className="max-w-55">
					<p className="flex items-center gap-1.5 text-sm font-medium">
						{row.original.official && (
							<Badge className={STATUS_TONE_CLASSES.success}>Équipe</Badge>
						)}
						<Link
							to={`/posts/${row.original.id}`}
							className="truncate hover:underline"
						>
							{row.original.title}
						</Link>
						{unreadReplies[row.original.id] ? (
							<Badge className={STATUS_TONE_CLASSES.warning}>
								{unreadRepliesLabel(unreadReplies[row.original.id] ?? 0)}
							</Badge>
						) : null}
					</p>
					<p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
						<MapPin className="h-3 w-3 shrink-0" />
						{row.original.ville}
						{row.original.commune ? ` · ${row.original.commune}` : ''}
					</p>
				</div>
			),
		},
		{
			accessorKey: 'category',
			header: 'Catégorie',
			cell: ({ row }) => (
				<Badge variant="outline">
					{CATEGORY_LABELS[row.original.category] ?? row.original.category}
				</Badge>
			),
		},
		{
			accessorKey: 'moderationStatus',
			header: 'Statut',
			cell: ({ row }) => {
				const cfg = MODERATION_CONFIG[row.original.moderationStatus]
				return <Badge className={cfg.className}>{cfg.label}</Badge>
			},
		},
		{
			accessorKey: 'views',
			header: 'Vues',
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.views}
				</span>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Date',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const post = row.original
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem asChild>
								<Link to={`/posts/${post.id}`}>
									<Eye className="mr-2 h-4 w-4" /> Voir le détail
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{post.moderationStatus !== 'published' && (
								<DropdownMenuItem
									onClick={() => handleModerate(post.id, 'published')}
								>
									<CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
									Approuver
								</DropdownMenuItem>
							)}
							{post.moderationStatus !== 'hidden' && (
								<DropdownMenuItem
									onClick={() => setHidingPost(post)}
									className="text-destructive focus:text-destructive"
								>
									<EyeOff className="mr-2 h-4 w-4" /> Masquer…
								</DropdownMenuItem>
							)}
							{post.moderationStatus !== 'pending' && (
								<DropdownMenuItem
									onClick={() => handleModerate(post.id, 'pending')}
								>
									<Clock className="mr-2 h-4 w-4 text-orange-600" />
									Remettre en attente
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]

	return (
		<>
			<div className="space-y-4 p-4 lg:p-6">
				{/* Counted by the API, over every row: hidden rather than showing
				    figures nobody measured. */}
				{counts && (
					<PostsStatsGrid
						total={counts.all ?? 0}
						published={counts.published ?? 0}
						pending={counts.pending ?? 0}
						hidden={counts.hidden ?? 0}
					/>
				)}

				<BentoCard variant="table">
					<PostsFilters counts={counts} />
					<div className="p-4">
						<DataTable
							columns={columns}
							data={posts}
							pagination={{ page, pageSize, total }}
						/>
					</div>
				</BentoCard>
			</div>

			<HidePostDialog
				post={hidingPost}
				submitting={moderateFetcher.state !== 'idle'}
				onOpenChange={open => !open && setHidingPost(null)}
				onConfirm={handleHide}
			/>
		</>
	)
}
