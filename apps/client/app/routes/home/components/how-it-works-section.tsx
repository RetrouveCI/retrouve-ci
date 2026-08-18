import { Search, Bell, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'

const STEPS = [
	{
		step: '01',
		icon: Search,
		title: 'Signalez ou Recherchez',
		description:
			'Publiez une annonce pour un objet perdu ou recherchez parmi les objets retrouvés par la communauté.',
		color: 'primary-green',
	},
	{
		step: '02',
		icon: Bell,
		title: 'Recevez des alertes',
		description:
			"Activez les notifications pour être informé dès qu'un objet correspondant à votre recherche est signalé.",
		color: 'accent-orange',
	},
	{
		step: '03',
		icon: CheckCircle,
		title: 'Récupérez votre objet',
		description:
			'Entrez en contact avec la personne et organisez la récupération de votre objet en toute sécurité.',
		color: 'primary-green',
	},
]

export function HowItWorksSection() {
	return (
		<section className="py-20 md:py-28">
			<div className="container mx-auto px-4">
				<div className="mb-16 space-y-4 text-center">
					<div className="bg-primary-green/10 text-primary-green inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
						<Sparkles className="h-4 w-4" />
						Comment ça marche
					</div>
					<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
						Retrouvez vos objets en{' '}
						<span className="text-primary-green">3 étapes</span>
					</h2>
					<p className="text-muted-foreground mx-auto max-w-xl">
						Un processus simple et efficace pour maximiser vos chances de
						retrouver ce qui vous appartient.
					</p>
				</div>

				<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
					{STEPS.map((item, index) => {
						const Icon = item.icon
						const colorVar = `var(--${item.color})`
						return (
							<div key={item.step} className="group relative">
								<div className="border-border/50 bg-background hover:border-border h-full rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
									<span
										className="absolute -top-4 -left-2 text-7xl font-bold opacity-10 select-none"
										style={{ color: colorVar }}
									>
										{item.step}
									</span>
									<div className="relative z-10">
										<div
											className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
											style={{ backgroundColor: `${colorVar}15` }}
										>
											<Icon className="h-7 w-7" style={{ color: colorVar }} />
										</div>
										<h3 className="mb-3 text-xl font-bold">{item.title}</h3>
										<p className="text-muted-foreground leading-relaxed">
											{item.description}
										</p>
									</div>
								</div>
								{index < 2 && (
									<div className="absolute top-1/2 -right-3 z-20 hidden -translate-y-1/2 md:flex">
										<ChevronRight className="text-muted-foreground/30 h-6 w-6" />
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
