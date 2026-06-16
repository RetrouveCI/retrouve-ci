import { useEffect, useState } from 'react'
import { useSearchParams, useFetcher } from 'react-router'
import {
	Badge,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { DataTable } from '@/shared/components/data-table'
import { PostsStatsGrid } from './components/posts-stats-grid'
import { PostDetailDialog } from './components/post-detail-dialog'
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
import type { Post, ModerationStatus } from './posts.types'
import type { Route } from './+types/index'

export const loader = postsLoader
export const action = postsAction

const MODERATION_CONFIG: Record<
	ModerationStatus,
	{ label: string; className: string }
> = {
	pending: {
		label: 'En attente',
		className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
	},
	published: {
		label: 'Publié',
		className: 'bg-green-100 text-green-700 hover:bg-green-100',
	},
	hidden: {
		label: 'Masqué',
		className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
	},
}

interface ActionResult {
	ok: boolean
	post?: Post
	intent?: string
	error?: string
}

export default function PostsPage({ loaderData }: Route.ComponentProps) {
	const { posts, total, statusFilter, typeFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()

	const [selectedPost, setSelectedPost] = useState<Post | null>(null)
	const [detailOpen, setDetailOpen] = useState(false)

	const moderateFetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (moderateFetcher.state !== 'idle' || !moderateFetcher.data) return
		if (moderateFetcher.data.ok) {
			const post = moderateFetcher.data.post
			if (post) {
				toast.success(
					`"${post.title}" — ${MODERATION_CONFIG[post.moderationStatus].label}`,
				)
				if (selectedPost?.id === post.id) {
					setSelectedPost(post)
				}
			}
		} else {
			toast.error(moderateFetcher.data.error ?? 'Impossible de modérer ce post')
		}
	}, [moderateFetcher.state, moderateFetcher.data, selectedPost?.id])

	const handleModerate = (id: string, moderationStatus: ModerationStatus) => {
		moderateFetcher.submit(
			{ intent: 'moderate', id, moderationStatus },
			{ method: 'post' },
		)
	}

	const handleStatusFilter = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') next.delete('status')
		else next.set('status', value)
		setSearchParams(next)
	}

	const handleTypeTab = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') next.delete('type')
		else next.set('type', value)
		setSearchParams(next)
	}

	const lostPosts = posts.filter(p => p.type === 'lost')
	const foundPosts = posts.filter(p => p.type === 'found')

	const counts = {
		total,
		published: posts.filter(p => p.moderationStatus === 'published').length,
		pending: posts.filter(p => p.moderationStatus === 'pending').length,
		hidden: posts.filter(p => p.moderationStatus === 'hidden').length,
	}

	const columns: ColumnDef<Post>[] = [
		{
			accessorKey: 'title',
			header: 'Titre',
			cell: ({ row }) => (
				<div className="max-w-[220px]">
					<p className="truncate text-sm font-medium">{row.original.title}</p>
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
				<Badge variant="outline" className="capitalize">
					{row.original.category}
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
							<DropdownMenuItem
								onClick={() => {
									setSelectedPost(post)
									setDetailOpen(true)
								}}
							>
								<Eye className="mr-2 h-4 w-4" /> Voir le détail
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
									onClick={() => handleModerate(post.id, 'hidden')}
									className="text-destructive focus:text-destructive"
								>
									<EyeOff className="mr-2 h-4 w-4" /> Masquer
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

	const activeTypeTab =
		typeFilter === 'found' ? 'found' : typeFilter === 'lost' ? 'lost' : 'all'

	return (
		<>
			<TopBar title="Posts" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<PostsStatsGrid
						total={counts.total}
						published={counts.published}
						pending={counts.pending}
						hidden={counts.hidden}
					/>

					<BentoCard variant="table">
						<div className="flex flex-wrap items-center gap-3 border-b p-4">
							<Select value={statusFilter} onValueChange={handleStatusFilter}>
								<SelectTrigger className="h-9 w-44">
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les statuts</SelectItem>
									<SelectItem value="pending">En attente</SelectItem>
									<SelectItem value="published">Publiés</SelectItem>
									<SelectItem value="hidden">Masqués</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="p-4">
							<Tabs value={activeTypeTab} onValueChange={handleTypeTab}>
								<TabsList className="mb-4">
									<TabsTrigger value="all">Tous ({posts.length})</TabsTrigger>
									<TabsTrigger value="lost">
										Perdus ({lostPosts.length})
									</TabsTrigger>
									<TabsTrigger value="found">
										Retrouvés ({foundPosts.length})
									</TabsTrigger>
								</TabsList>
								<TabsContent value="all">
									<DataTable
										columns={columns}
										data={posts}
										searchKey="title"
										searchPlaceholder="Rechercher par titre..."
									/>
								</TabsContent>
								<TabsContent value="lost">
									<DataTable
										columns={columns}
										data={lostPosts}
										searchKey="title"
										searchPlaceholder="Rechercher par titre..."
									/>
								</TabsContent>
								<TabsContent value="found">
									<DataTable
										columns={columns}
										data={foundPosts}
										searchKey="title"
										searchPlaceholder="Rechercher par titre..."
									/>
								</TabsContent>
							</Tabs>
						</div>
					</BentoCard>
				</div>
			</div>

			<PostDetailDialog
				post={selectedPost}
				open={detailOpen}
				onOpenChange={open => {
					setDetailOpen(open)
					if (!open) setSelectedPost(null)
				}}
				onModerate={handleModerate}
				isModerating={moderateFetcher.state !== 'idle'}
			/>
		</>
	)
}
