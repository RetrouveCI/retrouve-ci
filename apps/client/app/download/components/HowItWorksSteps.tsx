import { Smartphone, QrCode, Bell, ArrowRight } from 'lucide-react'

const steps = [
	{
		step: '01',
		icon: Smartphone,
		title: "Téléchargez l'app",
		desc: "Installez RetrouveCI depuis l'App Store ou Google Play.",
	},
	{
		step: '02',
		icon: QrCode,
		title: 'Collez vos stickers',
		desc: "Placez les stickers QR sur vos objets et activez-les dans l'app.",
	},
	{
		step: '03',
		icon: Bell,
		title: 'Restez serein',
		desc: 'Recevez des alertes dès que votre sticker est scanné.',
	},
]

export function HowItWorksSteps() {
	return (
		<section className="bg-muted/30 border-y py-16 md:py-20">
			<div className="container mx-auto px-4">
				<div className="mb-10 text-center">
					<h2 className="mb-3 text-3xl font-bold">Comment ça marche ?</h2>
					<p className="text-muted-foreground mx-auto max-w-md">
						Trois étapes pour protéger vos objets.
					</p>
				</div>
				<div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
					{steps.map((item, i) => (
						<div
							key={i}
							className="bg-background relative rounded-2xl border p-6 text-center"
						>
							<div className="text-muted-foreground/10 mb-3 text-5xl font-bold">
								{item.step}
							</div>
							<div className="bg-primary-green/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
								<item.icon className="text-primary-green h-6 w-6" />
							</div>
							<h3 className="mb-2 font-semibold">{item.title}</h3>
							<p className="text-muted-foreground text-sm">{item.desc}</p>
							{i < 2 && (
								<ArrowRight className="text-muted-foreground/30 absolute top-1/2 -right-3 z-10 hidden h-5 w-5 -translate-y-1/2 md:block" />
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
