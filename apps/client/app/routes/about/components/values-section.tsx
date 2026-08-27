import { Heart, ShieldCheck, Zap, Globe } from 'lucide-react'

const values = [
	{
		icon: Heart,
		title: 'Solidarité',
		description:
			'Nous croyons que chaque objet retrouvé est un acte de générosité envers un inconnu.',
		color: 'text-accent-orange',
		bg: 'bg-accent-orange/10',
	},
	{
		icon: ShieldCheck,
		title: 'Confiance',
		description:
			'La sécurité des données et la confidentialité de nos utilisateurs sont au cœur de tout ce que nous faisons.',
		color: 'text-primary-green',
		bg: 'bg-primary-green/10',
	},
	{
		icon: Zap,
		title: 'Simplicité',
		description:
			'Une interface pensée pour tous, accessible même sans expertise technologique.',
		color: 'text-accent-orange',
		bg: 'bg-accent-orange/10',
	},
	{
		icon: Globe,
		title: 'Inclusion',
		description:
			"RetrouveCI est conçu pour chaque habitant de Côte d'Ivoire, en ville comme en région.",
		color: 'text-primary-green',
		bg: 'bg-primary-green/10',
	},
]

export function ValuesSection() {
	return (
		<section className="border-t py-12 md:py-16">
			<div className="container mx-auto px-4">
				<div className="mb-10 max-w-xl">
					<h2 className="mb-3 text-3xl font-bold">Nos valeurs</h2>
					<p className="text-muted-foreground">
						Les principes qui guident chaque décision que nous prenons.
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{values.map(v => {
						const Icon = v.icon
						return (
							<div
								key={v.title}
								className="bg-background group rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1"
							>
								<div
									className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${v.bg} mb-4`}
								>
									<Icon className={`h-5 w-5 ${v.color}`} />
								</div>
								<h3 className="mb-2 font-bold">{v.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{v.description}
								</p>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
