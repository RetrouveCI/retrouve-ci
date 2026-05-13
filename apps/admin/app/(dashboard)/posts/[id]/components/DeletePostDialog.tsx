import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@retrouve-ci/ui/components'

interface DeletePostDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	postTitle: string
	onConfirm: () => void
}

export function DeletePostDialog({
	open,
	onOpenChange,
	postTitle,
	onConfirm,
}: DeletePostDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Supprimer ce post ?</AlertDialogTitle>
					<AlertDialogDescription>
						Cette action est irréversible. Le post{' '}
						<strong>&quot;{postTitle}&quot;</strong> sera définitivement
						supprimé.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Annuler</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Supprimer
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
