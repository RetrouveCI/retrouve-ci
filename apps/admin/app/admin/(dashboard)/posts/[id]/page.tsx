'use client'

import { Button } from '@retrouve-ci/ui/components'
import { use, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { usePost } from '@/application/posts/use-posts'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PostContentCard } from './components/PostContentCard'
import { ModerationCard } from './components/ModerationCard'
import { PostInfoCard } from './components/PostInfoCard'
import { HidePostDialog } from './components/HidePostDialog'
import { DeletePostDialog } from './components/DeletePostDialog'

export default function PostDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const router = useRouter()
	const [showHideDialog, setShowHideDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [hideReason, setHideReason] = useState('')
	const { post, isLoading, updateStatus, remove } = usePost(parseInt(id))

	if (isLoading) return null

	if (!post) {
		return (
			<>
				<TopBar title="Post non trouvé" />
				<div className="pt-16">
					<div className="p-4 lg:p-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertTriangle className="text-muted-foreground h-12 w-12" />
							<h2 className="mt-4 text-xl font-semibold">Post non trouvé</h2>
							<p className="text-muted-foreground mt-2">
								Le post demandé n&apos;existe pas ou a été supprimé.
							</p>
							<Button asChild className="mt-4">
								<Link href="/admin/posts">Retour aux posts</Link>
							</Button>
						</div>
					</div>
				</div>
			</>
		)
	}

	const handleApprove = async () => {
		await updateStatus('published')
		toast.success(`Post "${post.title}" approuvé et publié`)
	}

	const handleHide = async () => {
		await updateStatus('hidden')
		toast.success(`Post "${post.title}" masqué`)
		setShowHideDialog(false)
		setHideReason('')
	}

	const handleDelete = async () => {
		await remove()
		toast.success(`Post "${post.title}" supprimé`)
		setShowDeleteDialog(false)
		router.push('/admin/posts')
	}

	return (
		<>
			<TopBar title="Détail du post" />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<PostContentCard post={post} />
						</div>

						<div className="space-y-6">
							<ModerationCard
								status={post.status}
								onApprove={handleApprove}
								onHide={() => setShowHideDialog(true)}
								onDelete={() => setShowDeleteDialog(true)}
							/>
							<PostInfoCard
								createdAt={post.createdAt}
								updatedAt={post.updatedAt}
								views={post.views}
								contacts={post.contacts}
							/>
							<Button variant="outline" className="w-full" asChild>
								<Link href="/admin/posts">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Retour aux posts
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<HidePostDialog
				open={showHideDialog}
				onOpenChange={setShowHideDialog}
				reason={hideReason}
				onReasonChange={setHideReason}
				onConfirm={handleHide}
			/>
			<DeletePostDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				postTitle={post.title}
				onConfirm={handleDelete}
			/>
		</>
	)
}
