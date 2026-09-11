import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm } from 'react-hook-form'
import { Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button, FieldError, Textarea } from '@app/ui/components'
import { FormRootError, InputLabel } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import {
	createListingCommentSchema,
	type CreateListingCommentData,
	type CreateListingCommentInput,
} from '@app/contracts/listing-comments'
import { SectionHeader } from '@/routes/publish/components/section-header'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { formatShortRelativeDistance } from '@/shared/utils/date'
import { getInitials } from '@/shared/utils/initials'
import type { ListingComment } from '../../types/thread'
import { useMarkThreadRead } from '../hooks/use-mark-thread-read'
import type { action } from '../servers/thread.action'

const DESK_NAME = 'Équipe RetrouveCI'

interface ListingThreadProps {
	listingId: string
	thread: ListingComment[] | null
	accentColor: string
}

/**
 * Drawn once the team has written: a poster answers a suggestion here, and an
 * empty thread is not an invitation to open one.
 */
export function ListingThread({
	listingId,
	thread,
	accentColor,
}: ListingThreadProps) {
	useMarkThreadRead(listingId, thread)

	if (thread === null) {
		return (
			<p
				role="status"
				className="bg-background text-muted-foreground rounded-2xl border p-4 text-sm"
			>
				Impossible de charger vos échanges avec l’équipe. Réessayez dans un
				instant.
			</p>
		)
	}

	if (thread.length === 0) return null

	return (
		<section className="bg-background space-y-5 rounded-2xl border p-6">
			<SectionHeader
				icon={MessageSquare}
				title="Échanges avec l’équipe"
				description="Une suggestion pour aider votre annonce à aboutir."
				accentColor={accentColor}
			/>
			<ol className="space-y-4">
				{thread.map(comment => (
					<ThreadMessage key={comment.id} comment={comment} />
				))}
			</ol>
			<ReplyForm listingId={listingId} />
		</section>
	)
}

function ThreadMessage({ comment }: { comment: ListingComment }) {
	const fromDesk = comment.authorSide === 'admin'
	const name = fromDesk ? DESK_NAME : 'Vous'

	return (
		<li className="flex gap-3">
			<span
				aria-hidden
				className={cn(
					'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
					fromDesk
						? 'bg-primary-green text-white'
						: 'bg-muted text-muted-foreground border',
				)}
			>
				{getInitials(name)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="flex flex-wrap items-baseline gap-x-2">
					<span className="text-sm font-semibold">{name}</span>
					<time
						dateTime={comment.createdAt}
						className="text-muted-foreground text-xs"
					>
						{formatShortRelativeDistance(comment.createdAt)}
					</time>
				</p>
				<p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line">
					{comment.body}
				</p>
			</div>
		</li>
	)
}

function ReplyForm({ listingId }: { listingId: string }) {
	const fetcher = useActionFetcher<
		typeof action,
		CreateListingCommentInput,
		ListingComment
	>()

	const form = useForm<
		CreateListingCommentInput,
		unknown,
		CreateListingCommentData
	>({
		resolver: standardSchemaResolver(createListingCommentSchema),
		defaultValues: { body: '' },
		errors: fetcher.errors,
	})

	useSettledSubmission(fetcher.response, result => {
		if (!result.success) return

		form.reset()
		toast.success('Réponse envoyée à l’équipe')
	})

	const onSubmit = form.handleSubmit(({ body }) => {
		void fetcher.submit(
			{ intent: 'reply', body },
			{ method: 'post', action: `/account/posts/${listingId}/comments` },
		)
	})

	return (
		<form onSubmit={onSubmit} noValidate className="space-y-3 border-t pt-4">
			<Controller
				control={form.control}
				name="body"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor="thread-reply">Votre réponse</InputLabel>
						<Textarea
							{...field}
							id="thread-reply"
							value={field.value ?? ''}
							placeholder="Ce que vous avez ajouté ou corrigé…"
							className="min-h-24 resize-none"
							aria-invalid={fieldState.invalid || undefined}
						/>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>
			<FormRootError message={form.formState.errors.root?.message} />
			<Button
				type="submit"
				disabled={fetcher.isSubmitting}
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full text-white sm:w-auto"
			>
				{fetcher.isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Envoi…
					</>
				) : (
					'Envoyer ma réponse'
				)}
			</Button>
			<p className="text-muted-foreground text-xs">
				L’équipe est prévenue de votre réponse.
			</p>
		</form>
	)
}
