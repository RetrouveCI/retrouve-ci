import { useEffect, useState } from 'react'
import { EyeOff, Loader2 } from 'lucide-react'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@app/ui/components'
import {
	MAX_MODERATION_NOTE_LENGTH,
	type ModerationReason,
} from '@app/contracts/lost-items'
import { MODERATION_REASON_OPTIONS } from '../posts.const'
import type { Post } from '../types/posts.types'

export interface HideDecision {
	moderationReason?: ModerationReason
	moderationReasonNote?: string
}

interface HidePostDialogProps {
	post: Post | null
	submitting: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (decision: HideDecision) => void
}

/**
 * Hiding was one click; it asks for a reason now, because the poster is shown
 * it. The reason stays optional: a moderator who cannot word one must still be
 * able to act.
 */
export function HidePostDialog({
	post,
	submitting,
	onOpenChange,
	onConfirm,
}: HidePostDialogProps) {
	const [reason, setReason] = useState<ModerationReason | ''>('')
	const [note, setNote] = useState('')

	// The dialog stays mounted between openings; a previous choice must not be
	// applied to the next listing.
	useEffect(() => {
		if (post) {
			setReason('')
			setNote('')
		}
	}, [post])

	const needsNote = reason === 'other'
	const canConfirm = !submitting && (!needsNote || note.trim().length > 0)

	return (
		<Dialog open={post !== null} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Masquer cette annonce</DialogTitle>
					<DialogDescription>
						{post?.title} — le motif est montré à la personne qui l&apos;a
						publiée, dans « Mes annonces ».
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="moderationReason">Motif (optionnel)</Label>
						<Select
							value={reason}
							onValueChange={value => {
								if (!value) return

								setReason(value as ModerationReason)
								if (value !== 'other') setNote('')
							}}
						>
							<SelectTrigger id="moderationReason" className="w-full">
								<SelectValue placeholder="Aucun motif" />
							</SelectTrigger>
							<SelectContent>
								{MODERATION_REASON_OPTIONS.map(option => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{needsNote && (
						<div className="space-y-2">
							<Label htmlFor="moderationReasonNote">Précisez</Label>
							<Textarea
								id="moderationReasonNote"
								value={note}
								onChange={event => setNote(event.target.value)}
								maxLength={MAX_MODERATION_NOTE_LENGTH}
								placeholder="Ex : la 2e photo montre une carte bancaire."
								className="min-h-20 resize-none"
							/>
							<p className="text-muted-foreground text-xs">
								{note.length} / {MAX_MODERATION_NOTE_LENGTH}
							</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button
						variant="destructive"
						disabled={!canConfirm}
						onClick={() =>
							onConfirm({
								moderationReason: reason || undefined,
								moderationReasonNote: needsNote ? note.trim() : undefined,
							})
						}
					>
						{submitting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<EyeOff className="mr-2 h-4 w-4" />
						)}
						Masquer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
