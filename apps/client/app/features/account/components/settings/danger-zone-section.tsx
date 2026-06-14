import {
	Button,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@retrouve-ci/ui/components'
import { Trash2 } from 'lucide-react'

export function DangerZoneSection({
	onDeleteAccount,
}: {
	onDeleteAccount: () => void
}) {
	return (
		<div className="border-destructive/20 bg-destructive/5 overflow-hidden rounded-2xl border">
			<div className="border-destructive/20 bg-destructive/10 border-b p-5">
				<h2 className="text-destructive flex items-center gap-2 font-semibold">
					<Trash2 className="h-4 w-4" />
					Zone de danger
				</h2>
			</div>
			<div className="space-y-4 p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">Supprimer mon compte</p>
						<p className="text-muted-foreground text-xs">
							Cette action est irréversible et supprimera toutes vos données.
						</p>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" className="rounded-xl">
								Supprimer
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
								<AlertDialogDescription>
									Cette action supprimera définitivement votre compte, vos
									annonces et vos stickers. Cette action est irréversible.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-xl">
									Annuler
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDeleteAccount}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
								>
									Supprimer mon compte
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
