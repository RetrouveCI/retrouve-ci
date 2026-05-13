import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@retrouve-ci/ui/components'

interface RevokeTokenDialogProps {
	open: boolean
	tokenId: string
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

export function RevokeTokenDialog({ open, tokenId, onOpenChange, onConfirm }: RevokeTokenDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Révoquer ce token ?</AlertDialogTitle>
					<AlertDialogDescription>
						Cette action est irréversible. Le token{' '}
						<strong>{tokenId}</strong> ne pourra plus être utilisé.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Annuler</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Révoquer
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
