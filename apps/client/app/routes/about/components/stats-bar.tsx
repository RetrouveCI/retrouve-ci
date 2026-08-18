import { Gift, ShieldCheck, MapPin, Users } from 'lucide-react'

const pillars = [
	{ icon: Gift, label: '100 % gratuit' },
	{ icon: ShieldCheck, label: 'Contact sécurisé' },
	{ icon: MapPin, label: 'Couverture nationale' },
	{ icon: Users, label: 'Communautaire' },
]

export function StatsBar() {
	return (
		<section className="bg-muted/30 border-b">
			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
					{pillars.map(({ icon: Icon, label }) => (
						<div
							key={label}
							className="flex items-center justify-center gap-2.5"
						>
							<div className="bg-primary-green/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
								<Icon className="text-primary-green h-4.5 w-4.5" />
							</div>
							<span className="text-sm font-semibold">{label}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
