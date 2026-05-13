import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@retrouve-ci/ui/components'

interface ResetPasswordDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	adminEmail?: string
	onConfirm: () => void
	isSubmitting: boolean
}

export function ResetPasswordDialog({
	open,
	onOpenChange,
	adminEmail,
	onConfirm,
	isSubmitting,
}: ResetPasswordDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Réinitialiser le mot de passe</DialogTitle>
					<DialogDescription>
						Un email sera envoyé à {adminEmail} pour définir un nouveau mot de passe.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					<Button onClick={onConfirm} disabled={isSubmitting}>
						{isSubmitting ? 'Envoi...' : "Envoyer l'email"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
