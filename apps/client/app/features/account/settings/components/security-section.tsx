import { Shield } from 'lucide-react'
import { ChangePasswordDialog } from './change-password-dialog'

export function SecuritySection() {
	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<Shield className="text-primary-green h-4 w-4" />
					Sécurité
				</h2>
			</div>
			<div className="p-5">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-sm font-medium">Mot de passe</p>
						<p className="text-muted-foreground text-xs">
							Modifiez votre mot de passe de connexion
						</p>
					</div>
					<ChangePasswordDialog />
				</div>
			</div>
		</div>
	)
}
