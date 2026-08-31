import {
	Button,
	Badge,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@app/ui/components'
import { Link } from 'react-router'
import { useState } from 'react'
import {
	Eye,
	MessageCircle,
	Trash2,
	CheckCircle,
	XCircle,
	MapPin,
	Calendar,
	Package,
	ChevronRight,
	Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserLostItem } from '@/shared/types/lost-item'
import { cn } from '@app/ui/utils'
import { imageUrl } from '@/shared/utils/image'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import type { accountPostsAction } from '../servers/account-posts.action'

const STATUS_CONFIG = {
	pending: {
		label: 'En attente',
		color: 'bg-yellow-700 text-white',
		border: 'border-yellow-500/20',
	},
	hidden: {
		label: 'Masquée',
		color: 'bg-muted text-muted-foreground',
		border: 'border-muted',
	},
	active: {
		label: 'En ligne',
		color: 'bg-primary-green text-white',
		border: 'border-primary-green/20',
	},
	resolved: {
		label: 'Retrouvée',
		color: 'bg-blue-600 text-white',
		border: 'border-blue-500/20',
	},
	expired: {
		label: 'Archivée',
		color: 'bg-muted text-muted-foreground',
		border: 'border-muted',
	},
}

type DisplayStatus = keyof typeof STATUS_CONFIG

function getDisplayStatus(listing: UserLostItem): DisplayStatus {
	if (listing.moderationStatus === 'pending') return 'pending'
	if (listing.moderationStatus === 'hidden') return 'hidden'
	return listing.status
}

interface ListingCardProps {
	listing: UserLostItem
}

/** What the pending action promises, so its answer can be reported in its own words. */
const OUTCOMES = {
	resolved: {
		done: 'Annonce marquée retrouvée',
		failed: 'Impossible de marquer cette annonce retrouvée',
	},
	active: {
		done: 'Annonce remise en ligne',
		failed: 'Impossible de remettre cette annonce en ligne',
	},
	deleted: {
		done: 'Annonce supprimée',
		failed: 'Impossible de supprimer cette annonce',
	},
} as const

type Outcome = keyof typeof OUTCOMES

export function ListingCard({ listing }: ListingCardProps) {
	const fetcher = useActionFetcher<typeof accountPostsAction>()
	const [pending, setPending] = useState<Outcome | null>(null)
	const isUpdating = fetcher.isSubmitting
	const displayStatus = getDisplayStatus(listing)

	useSettledSubmission(fetcher.response, result => {
		if (!pending) return

		const outcome = OUTCOMES[pending]
		setPending(null)

		if (result.success) {
			toast.success(outcome.done)
			return
		}

		toast.error(result.errors?.root?.message ?? outcome.failed)
	})

	const handleStatusChange = (status: UserLostItem['status']) => {
		setPending(status === 'resolved' ? 'resolved' : 'active')
		void fetcher.submit(
			{ intent: 'update-status', id: listing.id, status },
			{ method: 'post' },
		)
	}

	const handleDelete = () => {
		setPending('deleted')
		void fetcher.submit(
			{ intent: 'delete', id: listing.id },
			{ method: 'post' },
		)
	}

	return (
		<div
			className={cn(
				'group bg-background relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg',
				STATUS_CONFIG[displayStatus].border,
			)}
		>
			<div
				className={cn(
					'h-1',
					displayStatus === 'active'
						? 'bg-primary-green'
						: displayStatus === 'resolved'
							? 'bg-blue-500'
							: displayStatus === 'pending'
								? 'bg-yellow-500'
								: 'bg-muted',
				)}
			/>

			<div className="flex gap-4 p-4">
				<div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
					{listing.image ? (
						<img
							src={imageUrl(listing.image, { width: 192 })}
							alt={listing.title}
							loading="lazy"
							decoding="async"
							className="absolute inset-0 h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<Package className="text-muted-foreground/30 h-8 w-8" />
						</div>
					)}
					<div
						className={cn(
							'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium',
							listing.type === 'lost'
								? 'bg-red-600 text-white'
								: 'bg-primary-green text-white',
						)}
					>
						{listing.type === 'lost' ? 'Perdu' : 'Trouvé'}
					</div>
				</div>

				<div className="flex min-w-0 flex-1 flex-col justify-between">
					<div>
						<div className="mb-1 flex items-center gap-2">
							<Badge
								className={cn(
									'text-[10px] font-medium',
									STATUS_CONFIG[displayStatus].color,
								)}
							>
								{STATUS_CONFIG[displayStatus].label}
							</Badge>
						</div>
						<h4 className="truncate font-semibold">{listing.title}</h4>
						<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
							<span className="flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								{listing.location}
							</span>
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{listing.date}
							</span>
						</div>
					</div>

					<div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
						<span className="flex items-center gap-1">
							<Eye className="h-3.5 w-3.5" />
							{listing.views} vue{listing.views > 1 ? 's' : ''}
						</span>
						<span className="flex items-center gap-1">
							<MessageCircle className="h-3.5 w-3.5" />
							{listing.contacts} contact{listing.contacts > 1 ? 's' : ''}
						</span>
					</div>
				</div>
			</div>

			{/* Wraps on purpose: with « Modifier » always present the four controls
			    outgrow a 390 px card, and the card clips what overflows. */}
			<div className="bg-muted/30 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t px-4 py-3">
				<div className="flex items-center gap-2">
					{listing.moderationStatus === 'published' &&
						listing.status === 'active' && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 gap-1.5 rounded-lg text-xs"
								disabled={isUpdating}
								onClick={() => handleStatusChange('resolved')}
							>
								<CheckCircle className="h-3.5 w-3.5" />
								Marquer retrouvée
							</Button>
						)}
					{listing.moderationStatus === 'published' &&
						listing.status === 'resolved' && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 gap-1.5 rounded-lg text-xs"
								disabled={isUpdating}
								onClick={() => handleStatusChange('active')}
							>
								<XCircle className="h-3.5 w-3.5" />
								Réactiver
							</Button>
						)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="h-8 gap-1.5 rounded-lg text-xs"
					>
						<Link to={`/account/posts/${listing.id}`}>
							<Pencil className="h-3.5 w-3.5" />
							Modifier
						</Link>
					</Button>
					<Button
						asChild
						variant="ghost"
						size="sm"
						className="h-8 rounded-lg text-xs"
					>
						<Link to={`/posts/${listing.id}`}>
							Voir <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
						</Link>
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								aria-label="Supprimer l'annonce"
								disabled={isUpdating}
								className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
								<AlertDialogDescription>
									Cette action est irréversible. L&apos;annonce sera
									définitivement supprimée.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-xl">
									Annuler
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
								>
									Supprimer
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
