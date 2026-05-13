import { Heart, QrCode, MapPin, Users } from 'lucide-react'

export function MissionBento() {
	return (
		<section className="py-12 md:py-16">
			<div className="container mx-auto px-4">
				<div className="grid gap-4 md:grid-cols-12">
					<div className="bg-background flex min-h-64 flex-col justify-between rounded-2xl border p-8 md:col-span-7">
						<div className="bg-primary-green/10 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl">
							<Heart className="text-primary-green h-6 w-6" />
						</div>
						<div>
							<h2 className="mb-3 text-2xl font-bold">Notre mission</h2>
							<p className="text-muted-foreground leading-relaxed">
								Réduire la perte définitive d&apos;objets en Côte d&apos;Ivoire grâce à
								une plateforme communautaire moderne, accessible et fiable. Chaque
								annonce publiée est une chance de redonner un objet à son propriétaire.
							</p>
						</div>
					</div>

					<div className="bg-primary-green flex min-h-48 flex-col justify-between rounded-2xl border p-8 text-white md:col-span-5">
						<p className="text-sm font-medium tracking-wider text-white/70 uppercase">
							Fondée en
						</p>
						<div>
							<p className="text-6xl font-bold">2024</p>
							<p className="mt-1 text-sm text-white/80">Abidjan, Côte d&apos;Ivoire</p>
						</div>
					</div>

					<div className="bg-background flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
						<div className="bg-accent-orange/10 inline-flex h-12 w-12 items-center justify-center rounded-xl">
							<QrCode className="text-accent-orange h-6 w-6" />
						</div>
						<div>
							<h3 className="mb-1.5 text-lg font-bold">Stickers QR</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Notre technologie de stickers QR permet d&apos;identifier instantanément
								l&apos;objet et de contacter son propriétaire sans jamais exposer ses
								données.
							</p>
						</div>
					</div>

					<div className="bg-background flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
						<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
							<MapPin className="h-6 w-6 text-blue-500" />
						</div>
						<div>
							<h3 className="mb-1.5 text-lg font-bold">Couverture nationale</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Présent dans 26 villes ivoiriennes, de l&apos;Abidjan cosmopolite aux
								villes de l&apos;intérieur comme Bouaké, Yamoussoukro et San-Pédro.
							</p>
						</div>
					</div>

					<div className="bg-muted/30 flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
						<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
							<Users className="h-6 w-6 text-rose-500" />
						</div>
						<div>
							<h3 className="mb-1.5 text-lg font-bold">Communauté active</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Plus de 15 000 utilisateurs font confiance à RetrouveCI chaque mois pour
								signaler, chercher et retrouver leurs objets.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
