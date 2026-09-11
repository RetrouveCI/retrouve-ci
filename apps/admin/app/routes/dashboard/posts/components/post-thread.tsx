import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Controller, useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button, Field, FieldError, Textarea } from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import {
	createListingCommentSchema,
	type CreateListingCommentData,
	type CreateListingCommentInput,
} from '@app/contracts/listing-comments'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { useMarkThreadRead } from '../hooks/use-mark-thread-read'
import { usePostThread } from '../hooks/use-post-thread'
import type { action } from '../servers/post-thread.action'
import type { Post, PostComment } from '../types/posts.types'

// The API keeps an author's account id to itself, so the desk signs as one.
const DESK_NAME = 'Équipe RetrouveCI'

/**
 * The system account owns a team listing and reads nothing, so there is no one
 * to converse with. The rule lives here rather than at each call site, and the
 * hooks below must not run for a thread that will never be read.
 */
export function PostThread({ post }: { post: Post }) {
	if (post.official) return null

	return <VisitorThread post={post} />
}

function VisitorThread({ post }: { post: Post }) {
	const comments = usePostThread(post.id)
	useMarkThreadRead(post.id, comments)

	return (
		<section className="rounded-xl border">
			<header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
				<h3 className="text-sm font-semibold">Échanges avec le posteur</h3>
				<span className="text-muted-foreground ml-auto text-xs">
					Visible par le posteur
				</span>
			</header>
			<div className="p-4">
				<ThreadMessages comments={comments} posterName={post.contactName} />
				<ThreadComposer postId={post.id} />
			</div>
		</section>
	)
}

function ThreadMessages({
	comments,
	posterName,
}: {
	comments: PostComment[] | null | undefined
	posterName: string
}) {
	if (comments === undefined) {
		return (
			<p className="text-muted-foreground text-sm">Chargement des échanges…</p>
		)
	}

	if (comments === null) {
		return (
			<p className="text-destructive text-sm">
				Impossible de charger les échanges.
			</p>
		)
	}

	if (comments.length === 0) {
		return (
			<p className="text-muted-foreground text-sm">
				Aucun échange pour l’instant.
			</p>
		)
	}

	return (
		<ol className="flex flex-col gap-3">
			{comments.map(comment => (
				<ThreadMessage
					key={comment.id}
					comment={comment}
					name={comment.authorSide === 'admin' ? DESK_NAME : posterName}
				/>
			))}
		</ol>
	)
}

function ThreadMessage({
	comment,
	name,
}: {
	comment: PostComment
	name: string
}) {
	const fromDesk = comment.authorSide === 'admin'

	return (
		<li className="flex gap-2.5">
			<span
				aria-hidden
				className={cn(
					'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
					fromDesk
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground border',
				)}
			>
				{initialsOf(name)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="flex flex-wrap items-baseline gap-2">
					<span className="text-sm font-semibold">{name}</span>
					<time
						dateTime={comment.createdAt}
						className="text-muted-foreground font-mono text-xs"
					>
						{format(new Date(comment.createdAt), "d MMM '·' HH:mm", {
							locale: fr,
						})}
					</time>
				</p>
				<p className="text-muted-foreground mt-0.5 text-sm leading-relaxed whitespace-pre-line">
					{comment.body}
				</p>
			</div>
		</li>
	)
}

function ThreadComposer({ postId }: { postId: string }) {
	const fetcher = useActionFetcher<
		typeof action,
		CreateListingCommentInput,
		PostComment
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
		toast.success('Message envoyé au posteur')
	})

	const onSubmit = form.handleSubmit(({ body }) => {
		fetcher.submit(
			{ intent: 'comment', body },
			{ method: 'post', action: `/posts/${postId}/comments` },
		)
	})

	return (
		<form onSubmit={onSubmit} noValidate className="mt-4 border-t pt-3">
			<Controller
				control={form.control}
				name="body"
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<Textarea
							{...field}
							aria-label="Message au posteur"
							aria-invalid={fieldState.invalid}
							placeholder="Écrire au posteur — une suggestion, pas une décision de modération…"
							className="min-h-16 resize-y"
						/>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
			<FormRootError
				message={form.formState.errors.root?.message}
				className="mt-2"
			/>
			<div className="mt-2 flex flex-wrap items-center gap-2.5">
				<Button type="submit" size="sm" disabled={fetcher.isSubmitting}>
					Envoyer
				</Button>
				<span className="text-muted-foreground text-xs">
					Le posteur reçoit une notification et peut répondre.
				</span>
			</div>
		</form>
	)
}

function initialsOf(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(word => word.charAt(0).toUpperCase())
		.join('')
}
