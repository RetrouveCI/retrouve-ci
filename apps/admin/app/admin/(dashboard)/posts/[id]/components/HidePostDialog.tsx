import { Button, Textarea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@retrouve-ci/ui/components'

interface HidePostDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	reason: string
	onReasonChange: (reason: string) => void
	onConfirm: () => void
}

export function HidePostDialog({
	open,
	onOpenChange,
	reason,
	onReasonChange,
	onConfirm,
}: HidePostDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Masquer ce post ?</DialogTitle>
					<DialogDescription>
						Le post ne sera plus visible publiquement. Vous pouvez indiquer une raison
						(optionnel).
					</DialogDescription>
				</DialogHeader>
				<Textarea
					placeholder="Raison du masquage (optionnel)..."
					value={reason}
					onChange={e => onReasonChange(e.target.value)}
					className="min-h-[100px]"
				/>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button onClick={onConfirm}>Masquer</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
