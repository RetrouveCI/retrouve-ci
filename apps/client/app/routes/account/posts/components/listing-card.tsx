import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Badge,
	Button,
} from '@app/ui/components'
import { useState } from 'react'
import {
	CheckCircle,
	ExternalLink,
	Eye,
	MessageCircle,
	MoreHorizontal,
	Package,
	Pencil,
	RotateCcw,
	Share2,
	Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserLostItem } from '@/shared/types/lost-item'
import { cn } from '@app/ui/utils'
import { imageUrl } from '@/shared/utils/image'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	buildContactsLabel,
	buildTimelineLabel,
} from '../helpers/listing-labels'
import { listingStatusFor } from '../helpers/listing-status'
import {
	ListingActionsSheet,
	type ListingSheetAction,
} from './listing-actions-sheet'
import { MatchesBand } from './matches-band'
import { MatchesSheet } from './matches-sheet'
import type { ListingMatches } from '../types/matches'
import type { accountPostsAction } from '../servers/account-posts.action'

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

interface ListingCardProps {
	listing: UserLostItem
	/** Absent until the matches request answers, and for every card with none. */
	matches?: ListingMatches
}

export function ListingCard({ listing, matches }: ListingCardProps) {
	const fetcher = useActionFetcher<typeof accountPostsAction>()
	const [pending, setPending] = useState<Outcome | null>(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [matchesOpen, setMatchesOpen] = useState(false)
	const isUpdating = fetcher.isSubmitting
	const config = listingStatusFor(listing)
	const isPending = listing.moderationStatus === 'pending'
	const isPublished = listing.moderationStatus === 'published'

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

	const handleShare = async () => {
		const url = `${window.location.origin}/posts/${listing.id}`

		if (navigator.share) {
			try {
				await navigator.share({ title: listing.title, url })
			} catch {
				// L'utilisateur a annulé le partage : rien à signaler.
			}
			return
		}

		try {
			await navigator.clipboard.writeText(url)
			toast.success('Lien copié dans le presse-papiers.')
		} catch {
			toast.error('Impossible de copier le lien.')
		}
	}

	/**
	 * The matrix of the `AnnonceCarte` artboard, read off the two axes. Sharing
	 * is the one entry gated on publication: a listing that is not published
	 * answers 404 to everyone but its author, so its link is unshareable — while
	 * viewing it still works for the author, which is who is holding the phone.
	 */
	const actions: ListingSheetAction[] = [
		...(isPublished && listing.status === 'active'
			? [
					{
						label: 'Marquer retrouvée',
						icon: CheckCircle,
						onSelect: () => handleStatusChange('resolved'),
					},
				]
			: []),
		...(isPublished && listing.status !== 'active'
			? [
					{
						label: 'Remettre en ligne',
						icon: RotateCcw,
						onSelect: () => handleStatusChange('active'),
					},
				]
			: []),
		{
			label: "Modifier l'annonce",
			icon: Pencil,
			to: `/account/posts/${listing.id}`,
		},
		{ label: "Voir l'annonce", icon: ExternalLink, to: `/posts/${listing.id}` },
		...(isPublished
			? [
					{
						label: "Partager l'annonce",
						icon: Share2,
						onSelect: () => void handleShare(),
					},
				]
			: []),
		{
			label: "Supprimer l'annonce",
			icon: Trash2,
			destructive: true,
			onSelect: () => setConfirmOpen(true),
		},
	]

	return (
		<article
			className={cn(
				'bg-background relative overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-md',
				config.border,
				config.dimmed && 'bg-muted/30',
			)}
		>
			<div className="flex gap-3 p-3.5">
				<div
					className={cn(
						'bg-muted relative h-21 w-21 shrink-0 overflow-hidden rounded-xl',
						config.dimmed && 'opacity-60',
					)}
				>
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
							<Package className="text-muted-foreground/30 h-7 w-7" />
						</div>
					)}
					<span
						className={cn(
							'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-xs font-semibold',
							listing.type === 'lost'
								? 'bg-red-700 text-white'
								: 'bg-primary-green text-white',
						)}
					>
						{listing.type === 'lost' ? 'Perdu' : 'Trouvé'}
					</span>
				</div>

				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-start gap-1">
						<div className="min-w-0 flex-1">
							{config.label && (
								<Badge
									className={cn(
										'mb-1 h-5.5 text-[10px] font-bold tracking-[0.04em] uppercase',
										config.badge,
									)}
								>
									{config.label}
								</Badge>
							)}
							<h3
								className={cn(
									'truncate font-semibold',
									config.dimmed && 'text-muted-foreground',
								)}
							>
								{listing.title}
							</h3>
							<p className="text-muted-foreground mt-0.5 truncate text-xs">
								{buildTimelineLabel(listing)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Actions sur cette annonce"
							aria-haspopup="dialog"
							disabled={isUpdating}
							onClick={() => setMenuOpen(true)}
							className="touch-target -mt-1 -mr-1 h-9 w-9 shrink-0 rounded-full"
						>
							<MoreHorizontal className="h-4.5 w-4.5" />
						</Button>
					</div>

					{/*
					 * A listing awaiting validation has no audience yet, so a zero would
					 * read as a failure. The sentence says why instead.
					 */}
					{isPending ? (
						<p className="text-muted-foreground mt-2 text-xs">
							Pas encore de vue&nbsp;: elle n&apos;est visible que de vous.
						</p>
					) : (
						<div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
							<span className="text-muted-foreground flex items-center gap-1.5">
								<Eye className="h-3.5 w-3.5 shrink-0" />
								{listing.views} vue{listing.views > 1 ? 's' : ''}
							</span>
							<span
								className={cn(
									'flex items-center gap-1.5',
									listing.contacts > 0
										? 'text-primary-green-text font-semibold'
										: 'text-muted-foreground',
								)}
							>
								<MessageCircle className="h-3.5 w-3.5 shrink-0" />
								{buildContactsLabel(listing.contacts)}
							</span>
						</div>
					)}
				</div>
			</div>

			{matches && (
				<MatchesBand
					matches={matches}
					type={listing.type}
					ville={listing.ville}
					onOpen={() => setMatchesOpen(true)}
				/>
			)}

			{matches && (
				<MatchesSheet
					open={matchesOpen}
					onOpenChange={setMatchesOpen}
					matches={matches}
					type={listing.type}
				/>
			)}

			<ListingActionsSheet
				open={menuOpen}
				onOpenChange={setMenuOpen}
				listingTitle={listing.title}
				actions={actions}
			/>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. L&apos;annonce sera définitivement
							supprimée.
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
		</article>
	)
}
