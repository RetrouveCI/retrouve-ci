import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'

interface DeleteAdminDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	adminName?: string
	onConfirm: () => void
	isSubmitting: boolean
}

export function DeleteAdminDialog({
	open,
	onOpenChange,
	adminName,
	onConfirm,
	isSubmitting,
}: DeleteAdminDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Supprimer l&apos;administrateur</DialogTitle>
					<DialogDescription>
						Êtes-vous sûr de vouloir supprimer le compte de {adminName} ? Cette
						action est irréversible.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Suppression...' : 'Supprimer'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
