import { BellRing, ScanLine, ShieldCheck } from 'lucide-react'

const highlights = [
	{
		icon: ShieldCheck,
		title: 'Modération centralisée',
		description: 'Posts, commandes et signalements au même endroit.',
	},
	{
		icon: ScanLine,
		title: 'Suivi des QR codes',
		description: 'Génération, activation et historique des scans.',
	},
	{
		icon: BellRing,
		title: 'Alertes en temps réel',
		description: 'Notifications et messages de contact instantanés.',
	},
]

export function BrandingPanel() {
	return (
		<div className="from-primary-green to-primary-green-dark relative hidden overflow-hidden bg-linear-to-br lg:flex lg:w-1/2 xl:w-[55%]">
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
				<div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
				<div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
			</div>

			<div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">
				<div className="flex w-fit items-center gap-3">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						height={48}
						className="h-12 w-auto"
					/>
					<span className="text-2xl font-bold">
						Retrouve<span className="text-white/80">CI</span>
					</span>
				</div>

				<div className="space-y-8">
					<div>
						<h1 className="mb-4 text-4xl leading-tight font-bold text-balance xl:text-5xl">
							Backoffice RetrouveCI
						</h1>
						<p className="max-w-md text-lg leading-relaxed text-white/80 xl:text-xl">
							Pilotez la plateforme objets perdus &amp; trouvés de Côte
							d&apos;Ivoire depuis une console unique.
						</p>
					</div>

					<div className="space-y-4">
						{highlights.map(item => {
							const Icon = item.icon
							return (
								<div key={item.title} className="flex items-center gap-4">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
										<Icon className="h-6 w-6" />
									</div>
									<div>
										<p className="font-semibold">{item.title}</p>
										<p className="text-sm text-white/70">{item.description}</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				<p className="text-sm text-white/70">
					© {new Date().getFullYear()} RetrouveCI · Administration
				</p>
			</div>
		</div>
	)
}
