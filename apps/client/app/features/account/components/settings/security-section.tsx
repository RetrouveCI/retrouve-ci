import { Button } from '@retrouve-ci/ui/components'
import { Shield } from 'lucide-react'

export function SecuritySection() {
	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<Shield className="text-primary-green h-4 w-4" />
					Sécurité
				</h2>
			</div>
			<div className="space-y-4 p-5">
				<div className="flex items-center justify-between py-3">
					<div>
						<p className="text-sm font-medium">Changer le code PIN</p>
						<p className="text-muted-foreground text-xs">
							Modifiez votre code de connexion
						</p>
					</div>
					<Button variant="outline" size="sm" className="rounded-xl">
						Modifier
					</Button>
				</div>
				<div className="flex items-center justify-between border-t py-3">
					<div>
						<p className="text-sm font-medium">Sessions actives</p>
						<p className="text-muted-foreground text-xs">
							Gérez vos appareils connectés
						</p>
					</div>
					<Button variant="outline" size="sm" className="rounded-xl">
						Voir
					</Button>
				</div>
			</div>
		</div>
	)
}
