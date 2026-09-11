import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
} from '@app/ui/components'
import { formatNumber } from '@app/contracts/shared'

interface BatchBarProps {
	selected: string[]
	onClear: () => void
	/** What the button reads, and the question the confirmation asks. */
	action: string
	confirmTitle: string
	confirmBody: string
	submitting?: boolean
	onConfirm: () => void
	disabled?: boolean
	/** Why the action is out of reach, when it is. */
	hint?: string
}

/**
 * What a selection can be done with. It always confirms: a batch is the one
 * gesture where a mis-click multiplies itself, and on orders each row tells a
 * buyer to expect a courier. The count is in the question, not only on the
 * button, so the operator reads it at the moment they commit.
 */
export function BatchBar({
	selected,
	onClear,
	action,
	confirmTitle,
	confirmBody,
	submitting = false,
	onConfirm,
	disabled = false,
	hint,
}: BatchBarProps) {
	const [asking, setAsking] = useState(false)

	if (selected.length === 0) return null

	const count = formatNumber(selected.length)

	return (
		<>
			<div
				role="region"
				aria-label="Sélection"
				className="bg-primary/10 border-primary/30 flex flex-wrap items-center gap-3 border-b px-3 py-2 text-sm"
			>
				<span className="font-medium">
					{count} sélectionné{selected.length > 1 ? 's' : ''}
				</span>
				{hint && <span className="text-muted-foreground text-xs">{hint}</span>}
				<div className="ml-auto flex flex-wrap items-center gap-2">
					<Button variant="ghost" size="sm" onClick={onClear}>
						Tout désélectionner
					</Button>
					<Button
						size="sm"
						disabled={disabled || submitting}
						onClick={() => setAsking(true)}
					>
						{submitting ? 'En cours…' : action}
					</Button>
				</div>
			</div>

			<AlertDialog open={asking} onOpenChange={setAsking}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
						<AlertDialogDescription>{confirmBody}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setAsking(false)
								onConfirm()
							}}
						>
							{action}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
