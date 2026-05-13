import Link from 'next/link'
import {
	ArrowRight,
	Search,
	Bell,
	TrendingUp,
	Clock,
	Users,
	QrCode,
	Smartphone,
} from 'lucide-react'

export function BentoGridSection() {
	return (
		<section className="bg-muted/30 py-20 md:py-28">
			<div className="container mx-auto px-4">
				<div className="mb-16 space-y-4 text-center">
					<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
						Tout pour{' '}
						<span className="relative">
							retrouver
							<svg
								className="absolute -bottom-1 left-0 h-2 w-full"
								viewBox="0 0 100 8"
								preserveAspectRatio="none"
							>
								<path
									d="M0 7 Q50 0 100 7"
									stroke="varprimary-green"
									strokeWidth="2"
									fill="none"
									strokeLinecap="round"
								/>
							</svg>
						</span>{' '}
						vos objets
					</h2>
					<p className="text-muted-foreground mx-auto max-w-xl">
						Une plateforme complète pour ne plus jamais perdre ce qui compte.
					</p>
				</div>

				<div className="mx-auto grid max-w-6xl grid-cols-12 gap-4">
					<div className="group col-span-12 md:col-span-8">
						<div className="bg-primary-green relative h-full min-h-[280px] overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl">
							<div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/10" />
							<div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
							<div className="relative z-10 flex h-full flex-col">
								<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
									<Search className="h-7 w-7 text-white" />
								</div>
								<h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
									Recherche intelligente
								</h3>
								<p className="max-w-md flex-1 text-base text-white/80">
									Filtres avancés par catégorie, lieu et date pour trouver
									rapidement parmi des milliers d&apos;annonces.
								</p>
								<Link
									href="/posts"
									className="group/link mt-4 inline-flex items-center gap-2 font-medium text-white"
								>
									Explorer
									<ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
								</Link>
							</div>
						</div>
					</div>

					<div className="group col-span-12 md:col-span-4">
						<div className="bg-background border-border/50 hover:border-border relative h-full min-h-[280px] overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg">
							<div className="flex h-full flex-col justify-between">
								<div>
									<div className="bg-accent-orange/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
										<TrendingUp className="text-accent-orange h-6 w-6" />
									</div>
									<h3 className="mb-1 text-lg font-bold">27 villes</h3>
									<p className="text-muted-foreground text-sm">
										Couverture nationale
									</p>
								</div>
								<div className="mt-6 space-y-3">
									{[
										{ label: 'Abidjan', width: '85%' },
										{ label: 'Bouaké', width: '45%' },
										{ label: 'Autres', width: '30%' },
									].map(({ label, width }) => (
										<div key={label} className="flex items-center gap-3">
											<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
												<div
													className="bg-primary-green h-full rounded-full"
													style={{ width }}
												/>
											</div>
											<span className="text-muted-foreground w-16 text-xs">
												{label}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="group col-span-12 md:col-span-4 md:row-span-2">
						<div className="bg-background border-border/50 hover:border-border relative h-full min-h-[400px] overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg">
							<div className="flex h-full flex-col">
								<div className="bg-accent-orange/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
									<Bell className="text-accent-orange h-6 w-6" />
								</div>
								<h3 className="mb-1 text-lg font-bold">
									Alertes en temps réel
								</h3>
								<p className="text-muted-foreground mb-6 text-sm">
									Soyez notifié dès qu&apos;un objet correspondant est signalé.
								</p>
								<div className="flex flex-1 flex-col justify-end space-y-2">
									{[
										{
											title: 'iPhone 15 retrouvé',
											loc: 'Cocody',
											time: '2 min',
											isNew: true,
										},
										{
											title: 'Clés de voiture',
											loc: 'Plateau',
											time: '15 min',
											isNew: true,
										},
										{
											title: 'Portefeuille',
											loc: 'Marcory',
											time: '1h',
											isNew: false,
										},
									].map((n, i) => (
										<div
											key={i}
											className={`bg-background rounded-xl border p-3 transition-all duration-300 ${
												i === 0
													? 'border-primary-green/30 shadow-sm'
													: 'scale-[0.98] opacity-60'
											}`}
										>
											<div className="flex items-start gap-2">
												{n.isNew && (
													<span className="bg-primary-green mt-1.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" />
												)}
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">
														{n.title}
													</p>
													<p className="text-muted-foreground text-xs">
														{n.loc} · {n.time}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="group col-span-6 md:col-span-4">
						<div className="border-border/50 relative h-full min-h-[180px] overflow-hidden rounded-3xl border bg-linear-to-br from-blue-500/10 to-blue-600/5 p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg">
							<div className="flex h-full flex-col">
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 transition-transform group-hover:scale-110">
									<Clock className="h-5 w-5 text-blue-600" />
								</div>
								<h3 className="mb-1 text-base font-bold">2 minutes</h3>
								<p className="text-muted-foreground text-xs">
									Pour publier une annonce
								</p>
							</div>
						</div>
					</div>

					<div className="group col-span-6 md:col-span-4">
						<div className="border-border/50 relative h-full min-h-[180px] overflow-hidden rounded-3xl border bg-linear-to-br from-purple-500/10 to-purple-600/5 p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg">
							<div className="flex h-full flex-col">
								<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 transition-transform group-hover:scale-110">
									<Users className="h-5 w-5 text-purple-600" />
								</div>
								<h3 className="mb-1 text-base font-bold">12 500+</h3>
								<p className="text-muted-foreground text-xs">Membres actifs</p>
							</div>
						</div>
					</div>

					<div className="group col-span-12 md:col-span-8">
						<div className="border-border/50 from-accent-orange/10 via-accent-orange/5 hover:border-accent-orange/30 relative h-full min-h-[220px] overflow-hidden rounded-3xl border bg-linear-to-r to-transparent p-8 transition-all duration-300 hover:shadow-lg">
							<div className="bg-accent-orange/10 absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-2xl" />
							<div className="relative z-10 flex h-full flex-col items-start gap-6 md:flex-row md:items-center">
								<div className="bg-accent-orange/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
									<QrCode className="text-accent-orange h-8 w-8" />
								</div>
								<div className="flex-1">
									<h3 className="mb-2 text-xl font-bold">
										Stickers QR sécurisés
									</h3>
									<p className="text-muted-foreground mb-4 max-w-md text-sm">
										Protégez vos objets avec nos QR codes. Toute personne qui
										les trouve peut vous contacter sans voir vos informations.
									</p>
									<Link
										href="/stickers"
										className="group/link text-accent-orange inline-flex items-center gap-2 text-sm font-medium"
									>
										Découvrir
										<ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
									</Link>
								</div>
							</div>
						</div>
					</div>

					<div className="group col-span-12 md:col-span-4">
						<Link href="/download" className="block h-full">
							<div className="bg-foreground relative h-full min-h-[220px] overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-xl">
								<div className="bg-primary-green/20 absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" />
								<div className="relative z-10 flex h-full flex-col">
									<div className="mb-4 flex items-center gap-2">
										<Smartphone className="h-5 w-5 text-white/70" />
										<span className="bg-primary-green/20 text-primary-green rounded-full px-2 py-0.5 text-xs font-medium">
											Bientôt
										</span>
									</div>
									<h3 className="mb-1 text-lg font-bold text-white">
										App mobile
									</h3>
									<p className="flex-1 text-sm text-white/60">
										Scanner et signaler en un geste.
									</p>
									<div className="mt-4 flex gap-3">
										<span className="text-xs text-white/40">iOS</span>
										<span className="text-xs text-white/40">Android</span>
									</div>
								</div>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
