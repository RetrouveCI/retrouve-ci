import { Shield, Clock, MapPin } from 'lucide-react'

export function TrustBadges() {
	return (
		<div className="text-muted-foreground mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-6 text-sm">
			<span className="flex items-center gap-1.5">
				<Shield className="text-primary-green h-4 w-4" />
				Données protégées
			</span>
			<span className="flex items-center gap-1.5">
				<Clock className="text-primary-green h-4 w-4" />
				Publication instantanée
			</span>
			<span className="flex items-center gap-1.5">
				<MapPin className="text-primary-green h-4 w-4" />
				Toute la Côte d&apos;Ivoire
			</span>
		</div>
	)
}
