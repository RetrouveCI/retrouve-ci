import Image from 'next/image'
import Link from 'next/link'
import { Smartphone, MapPin, Shield } from 'lucide-react'

export function BrandingPanel() {
	return (
		<div className="from-primary-green to-primary-green-dark relative hidden overflow-hidden bg-linear-to-br lg:flex lg:w-1/2 xl:w-[55%]">
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
				<div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
				<div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
			</div>

			<div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-16">
				<Link href="/" className="group flex w-fit items-center gap-3">
					<Image
						src="/logo.png"
						alt="RetrouveCI"
						width={48}
						height={48}
						className="rounded-xl transition-transform group-hover:scale-105"
						priority
					/>
					<span className="text-2xl font-bold">
						Retrouve<span className="text-white/80">CI</span>
					</span>
				</Link>

				<div className="space-y-8">
					<div>
						<h1 className="mb-4 text-4xl leading-tight font-bold text-balance xl:text-5xl">
							Retrouvez ce qui compte pour vous
						</h1>
						<p className="max-w-md text-lg leading-relaxed text-white/80 xl:text-xl">
							La plateforme de confiance pour retrouver vos objets perdus en
							Cote d&apos;Ivoire.
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
								<Smartphone className="h-6 w-6" />
							</div>
							<div>
								<p className="font-semibold">Alertes instantanees</p>
								<p className="text-sm text-white/70">
									Soyez notifie des qu&apos;un objet correspond
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
								<MapPin className="h-6 w-6" />
							</div>
							<div>
								<p className="font-semibold">Couverture nationale</p>
								<p className="text-sm text-white/70">
									Toutes les villes de Cote d&apos;Ivoire
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
								<Shield className="h-6 w-6" />
							</div>
							<div>
								<p className="font-semibold">100% securise</p>
								<p className="text-sm text-white/70">
									Vos donnees restent privees
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-8">
					<div>
						<p className="text-3xl font-bold xl:text-4xl">2,500+</p>
						<p className="text-sm text-white/70">Objets retrouves</p>
					</div>
					<div>
						<p className="text-3xl font-bold xl:text-4xl">15,000+</p>
						<p className="text-sm text-white/70">Utilisateurs actifs</p>
					</div>
					<div>
						<p className="text-3xl font-bold xl:text-4xl">50+</p>
						<p className="text-sm text-white/70">Villes couvertes</p>
					</div>
				</div>
			</div>
		</div>
	)
}
