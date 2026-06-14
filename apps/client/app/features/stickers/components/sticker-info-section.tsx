import { CheckCircle, Wallet, Key, Briefcase, Laptop } from 'lucide-react'

const OBJECT_EXAMPLES = [
	{ icon: Wallet, name: 'Portefeuille' },
	{ icon: Key, name: 'Clés' },
	{ icon: Briefcase, name: 'Sac' },
	{ icon: Laptop, name: 'Électronique' },
]

export function StickerInfoSection() {
	return (
		<section className="py-8 md:py-12">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-5xl">
					<div className="grid gap-4 md:grid-cols-5">
						<div className="from-primary-green/5 rounded-2xl border bg-linear-to-br to-transparent p-8 md:col-span-3">
							<h2 className="mb-3 text-2xl font-bold">
								Qu&apos;est-ce qu&apos;un sticker RetrouveCI ?
							</h2>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								Un QR code unique et résistant que vous collez sur vos objets
								importants. Chaque sticker possède un code unique lié à votre
								compte, permettant une récupération sécurisée.
							</p>
							<div className="flex flex-wrap gap-2">
								{OBJECT_EXAMPLES.map(item => (
									<div
										key={item.name}
										className="bg-background flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
									>
										<item.icon className="text-primary-green h-4 w-4" />
										<span>{item.name}</span>
									</div>
								))}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 md:col-span-2">
							<div className="bg-background flex flex-col justify-center rounded-2xl border p-5">
								<div className="text-primary-green text-3xl font-bold">
									100%
								</div>
								<p className="text-muted-foreground text-sm">
									Anonymat garanti
								</p>
							</div>
							<div className="bg-background flex flex-col justify-center rounded-2xl border p-5">
								<div className="text-accent-orange text-3xl font-bold">
									2 min
								</div>
								<p className="text-muted-foreground text-sm">Pour activer</p>
							</div>
							<div className="bg-primary-green col-span-2 rounded-2xl p-5 text-white">
								<CheckCircle className="mb-2 h-6 w-6" />
								<p className="font-medium">
									Stickers réutilisables et transférables
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
