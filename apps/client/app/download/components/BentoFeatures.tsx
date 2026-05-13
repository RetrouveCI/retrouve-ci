import { QrCode, Bell, Shield, Zap, MapPin, Star } from 'lucide-react'

export function BentoFeatures() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="mb-10 text-center">
					<h2 className="mb-3 text-3xl font-bold md:text-4xl">
						Tout ce dont vous avez besoin
					</h2>
					<p className="text-muted-foreground mx-auto max-w-md">
						Une app pensée pour retrouver vos objets rapidement et en toute sécurité.
					</p>
				</div>

				<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="group bg-background hover:border-primary-green/40 rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg sm:col-span-2">
						<div className="mb-6 flex items-start justify-between">
							<div className="bg-primary-green/10 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
								<QrCode className="text-primary-green h-6 w-6" />
							</div>
							<span className="text-muted-foreground rounded-full border px-2 py-1 text-xs">
								Phare
							</span>
						</div>
						<h3 className="mb-2 text-xl font-bold">Scan QR instantané</h3>
						<p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
							Pointez votre caméra vers n&apos;importe quel sticker RetrouveCI pour
							identifier l&apos;objet et contacter son propriétaire en moins de 3
							secondes.
						</p>
					</div>

					<div className="group bg-background hover:border-accent-orange/40 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg">
						<div className="bg-accent-orange/10 mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
							<Bell className="text-accent-orange h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold">Alertes push</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Notifié immédiatement quand votre objet est scanné.
						</p>
					</div>

					<div className="group bg-background hover:border-primary-green/40 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg">
						<div className="bg-primary-green/10 mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
							<Shield className="text-primary-green h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold">Contact sécurisé</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Via WhatsApp, sans révéler votre numéro.
						</p>
					</div>

					<div className="group bg-background hover:border-primary-green/40 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg">
						<div className="bg-primary-green/10 mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
							<Zap className="text-primary-green h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold">Mode hors-ligne</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Vos stickers accessibles même sans connexion.
						</p>
					</div>

					<div className="group bg-primary-green rounded-2xl border p-6 text-white transition-all duration-300 hover:shadow-lg">
						<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
							<MapPin className="h-6 w-6 text-white" />
						</div>
						<h3 className="mb-2 font-bold">Toute la Côte d&apos;Ivoire</h3>
						<p className="text-sm leading-relaxed text-white/80">
							Couverture nationale, de Abidjan à Bouaké.
						</p>
					</div>

					<div className="group bg-background hover:border-accent-orange/40 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg">
						<div className="mb-4 flex items-center gap-1">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className="fill-accent-orange text-accent-orange h-5 w-5" />
							))}
						</div>
						<blockquote className="text-muted-foreground mb-4 text-sm leading-relaxed italic">
							&ldquo;J&apos;ai retrouvé mon téléphone en 20 minutes grâce à RetrouveCI.
							Incroyable !&rdquo;
						</blockquote>
						<p className="text-xs font-medium">— Kouamé A., Abidjan</p>
					</div>
				</div>
			</div>
		</section>
	)
}
