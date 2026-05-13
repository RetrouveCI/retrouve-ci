'use client'

import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@retrouve-ci/ui/components'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import {
	PostsFilter,
	type PostsFilterState,
} from '@/app/admin/(dashboard)/posts/components/posts-filter'
import { BentoCard } from '@/components/admin/bento-card'
import { usePosts } from '@/application/posts/use-posts'
import type { Post } from '@/domain/entities/post'
import {
	Eye,
	EyeOff,
	Trash2,
	FileText,
	AlertTriangle,
	CheckCircle2,
	Clock,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function PostsPage() {
	const [filters, setFilters] = useState<PostsFilterState>({
		status: 'all',
		type: 'all',
		location: 'all',
		dateRange: undefined,
	})
	const [deletePost, setDeletePost] = useState<Post | null>(null)
	const { posts, updateStatus, remove: removePost } = usePosts()

	const locations = useMemo(
		() => [...new Set(posts.map(p => p.location))],
		[posts],
	)

	const filteredPosts = useMemo(() => {
		let result = posts
		if (filters.status !== 'all')
			result = result.filter(p => p.status === filters.status)
		if (filters.type !== 'all')
			result = result.filter(p => p.type === filters.type)
		if (filters.location !== 'all')
			result = result.filter(p => p.location === filters.location)
		if (filters.dateRange?.from) {
			result = result.filter(p => {
				const d = new Date(p.date)
				return (
					d >= filters.dateRange!.from! &&
					(!filters.dateRange!.to || d <= filters.dateRange!.to)
				)
			})
		}
		return result
	}, [filters])

	const totalPublished = posts.filter(p => p.status === 'published').length
	const totalPending = posts.filter(p => p.status === 'pending').length
	const totalLost = posts.filter(p => p.type === 'lost').length

	const handleDelete = async () => {
		if (deletePost) {
			await removePost(deletePost.id)
			toast.success(`Post "${deletePost.title}" supprimé`)
			setDeletePost(null)
		}
	}

	const handleToggleVisibility = async (post: Post) => {
		const newStatus = post.status === 'hidden' ? 'published' : 'hidden'
		await updateStatus(post.id, newStatus)
		toast.success(newStatus === 'hidden' ? `Post masqué` : `Post affiché`)
	}

	const columns: ColumnDef<Post>[] = [
		{
			accessorKey: 'title',
			header: 'Titre',
			cell: ({ row }) => (
				<div className="max-w-[200px]">
					<p className="truncate text-sm font-medium">{row.original.title}</p>
					<p className="text-muted-foreground truncate text-xs">
						par {row.original.authorName}
					</p>
				</div>
			),
		},
		{
			accessorKey: 'type',
			header: 'Type',
			cell: ({ row }) => (
				<Badge
					className={
						row.original.type === 'lost'
							? 'bg-red-100 text-red-700 hover:bg-red-100'
							: 'bg-green-100 text-green-700 hover:bg-green-100'
					}
				>
					{row.original.type === 'lost' ? 'Perdu' : 'Retrouvé'}
				</Badge>
			),
		},
		{
			accessorKey: 'location',
			header: 'Lieu',
			cell: ({ row }) => (
				<span className="text-sm">{row.original.location}</span>
			),
		},
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) =>
				format(new Date(row.original.date), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge
					className={
						row.original.status === 'published'
							? 'bg-green-100 text-green-700 hover:bg-green-100'
							: row.original.status === 'pending'
								? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
					}
				>
					{row.original.status === 'published'
						? 'Publié'
						: row.original.status === 'pending'
							? 'En attente'
							: 'Masqué'}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
						<Link href={`/admin/posts/${row.original.id}`}>
							<Eye className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => handleToggleVisibility(row.original)}
					>
						{row.original.status === 'hidden' ? (
							<Eye className="h-4 w-4" />
						) : (
							<EyeOff className="h-4 w-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="text-destructive hover:text-destructive h-8 w-8"
						onClick={() => setDeletePost(row.original)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	]

	const lostPosts = filteredPosts.filter(p => p.type === 'lost')
	const foundPosts = filteredPosts.filter(p => p.type === 'found')
	const activeTab = filters.type === 'found' ? 'found' : 'lost'

	return (
		<>
			<TopBar title="Posts" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					{/* Bento stat grid */}
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<BentoCard
							variant="highlight"
							title="Total posts"
							value={posts.length}
							icon={FileText}
						/>
						<BentoCard
							variant="stat"
							title="Publiés"
							value={totalPublished}
							icon={CheckCircle2}
							iconColor="text-green-600"
							iconBgColor="bg-green-100"
						/>
						<BentoCard
							variant="stat"
							title="En attente"
							value={totalPending}
							icon={Clock}
							iconColor="text-orange-600"
							iconBgColor="bg-orange-100"
						/>
						<BentoCard
							variant="stat"
							title="Perdus signalés"
							value={totalLost}
							icon={AlertTriangle}
							iconColor="text-red-500"
							iconBgColor="bg-red-100"
						/>
					</div>

					{/* Table bento card */}
					<BentoCard variant="table">
						<div className="border-b p-4">
							<PostsFilter
								filters={filters}
								onFiltersChange={setFilters}
								locations={locations}
							/>
						</div>
						<div className="p-4">
							<Tabs
								defaultValue="lost"
								value={activeTab}
								onValueChange={v =>
									setFilters(prev => ({
										...prev,
										type: v === 'all' ? 'all' : v,
									}))
								}
							>
								<TabsList className="mb-4">
									<TabsTrigger value="lost">
										Perdus ({lostPosts.length})
									</TabsTrigger>
									<TabsTrigger value="found">
										Retrouvés ({foundPosts.length})
									</TabsTrigger>
								</TabsList>
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

			<AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. Le post{' '}
							<strong>&quot;{deletePost?.title}&quot;</strong> sera
							définitivement supprimé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
