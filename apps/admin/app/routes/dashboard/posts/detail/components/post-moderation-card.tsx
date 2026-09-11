import { useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { CheckCircle2, Clock, EyeOff } from 'lucide-react'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@app/ui/components'
import {
	HidePostDialog,
	type HideDecision,
} from '../../components/hide-post-dialog'
import { MODERATION_CONFIG, MODERATION_REASON_LABELS } from '../../posts.const'
import type { postsAction } from '../../servers/posts.action'
import type { ModerationStatus, Post } from '../../types/posts.types'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'

/**
 * The decisions a moderator takes on the listing. Hiding asks for a reason,
 * so it keeps its own dialog — an action dialog stays a dialog, the page only
 * replaces the read one.
 */
export function PostModerationCard({ post }: { post: Post }) {
	const [hiding, setHiding] = useState(false)

	const fetcher = useActionFetcher<typeof postsAction, FieldValues, Post>()

	useSettledSubmission(fetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ?? 'Impossible de modérer cette annonce',
			)
			return
		}

		const moderated = result.data
		if (moderated)
			toast.success(MODERATION_CONFIG[moderated.moderationStatus].label)
	})

	const moderate = (
		moderationStatus: ModerationStatus,
		decision: HideDecision = {},
	) => {
		fetcher.submit(
			{
				intent: 'moderate',
				id: post.id,
				moderationStatus,
				moderationReason: decision.moderationReason ?? '',
				moderationReasonNote: decision.moderationReasonNote ?? '',
			},
			{ method: 'post' },
		)
	}

	const submitting = fetcher.isSubmitting

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Modération</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{post.moderationStatus !== 'published' && (
						<Button
							className="w-full justify-start"
							disabled={submitting}
							onClick={() => moderate('published')}
						>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							Approuver
						</Button>
					)}
					{post.moderationStatus !== 'hidden' && (
						<Button
							variant="outline"
							className="text-destructive hover:bg-destructive/10 w-full justify-start"
							disabled={submitting}
							onClick={() => setHiding(true)}
						>
							<EyeOff className="mr-2 h-4 w-4" />
							Masquer…
						</Button>
					)}
					{post.moderationStatus !== 'pending' && (
						<Button
							variant="outline"
							className="w-full justify-start"
							disabled={submitting}
							onClick={() => moderate('pending')}
						>
							<Clock className="mr-2 h-4 w-4" />
							Remettre en attente
						</Button>
					)}

					{/* Why it was hidden, in the moderator's own words. The poster
					    reads the contract's sentence, never this note. */}
					{post.moderationReason && (
						<div className="text-muted-foreground space-y-1 border-t pt-3 text-sm">
							<p className="text-foreground font-medium">
								{MODERATION_REASON_LABELS[post.moderationReason]}
							</p>
							{post.moderationReasonNote && (
								<p className="whitespace-pre-line">
									{post.moderationReasonNote}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<HidePostDialog
				post={hiding ? post : null}
				submitting={submitting}
				onOpenChange={open => !open && setHiding(false)}
				onConfirm={decision => {
					moderate('hidden', decision)
					setHiding(false)
				}}
			/>
		</>
	)
}
