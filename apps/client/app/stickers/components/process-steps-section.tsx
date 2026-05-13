import { Package, QrCode, Shield, Heart } from 'lucide-react'

const PROCESS_STEPS = [
	{
		number: 1,
		icon: Package,
		title: 'Commandez',
		description:
			'Recevez vos stickers QR avec un code unique pour chaque objet.',
	},
	{
		number: 2,
		icon: QrCode,
		title: 'Activez',
		description:
			'Liez le QR code à votre compte en entrant simplement le code.',
	},
	{
		number: 3,
		icon: Shield,
		title: 'Protégez',
		description: 'Collez le sticker sur vos objets importants.',
	},
	{
		number: 4,
		icon: Heart,
		title: 'Récupérez',
		description: "On vous contacte si quelqu'un retrouve votre objet.",
	},
]

export function ProcessStepsSection() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="mb-12 text-center">
					<h2 className="mb-3 text-3xl font-bold md:text-4xl">
						Comment ça marche
					</h2>
					<p className="text-muted-foreground mx-auto max-w-lg">
						De la commande à la récupération, tout est simple et sécurisé.
					</p>
				</div>

				<div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
					{PROCESS_STEPS.map(step => (
						<div
							key={step.number}
							className="group bg-background relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-green/30 hover:shadow-lg"
						>
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-green/10 transition-colors group-hover:bg-primary-green">
									<step.icon className="h-5 w-5 text-primary-green transition-colors group-hover:text-white" />
								</div>
								<span className="text-muted-foreground/30 text-3xl font-bold">
									{step.number}
								</span>
							</div>
							<h3 className="mb-1 font-semibold">{step.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
