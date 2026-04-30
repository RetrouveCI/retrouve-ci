'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
	ArrowRight,
	Search,
	Bell,
	Shield,
	Smartphone,
	MapPin,
	Clock,
	CheckCircle,
	ChevronRight,
	Sparkles,
	QrCode,
	Users,
	TrendingUp,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@repo/ui/lib/utils'

// Cycling words for hero
const CYCLING_WORDS = [
	'un objet',
	'un téléphone',
	'une clé',
	'un portefeuille',
	'un sac',
	'un bijou',
]

function CyclingWord() {
	const [index, setIndex] = useState(0)
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const interval = setInterval(() => {
			setIsVisible(false)
			setTimeout(() => {
				setIndex((i) => (i + 1) % CYCLING_WORDS.length)
				setIsVisible(true)
			}, 300)
		}, 2500)
		return () => clearInterval(interval)
	}, [])

	return (
		<span
			className={cn(
				'inline-block transition-all duration-300 ease-out',
				isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
			)}
		>
			{CYCLING_WORDS[index]}
		</span>
	)
}

function AnimatedCounter({
	target,
	suffix = '',
}: {
	target: number
	suffix?: string
}) {
	const [count, setCount] = useState(0)

	useEffect(() => {
		const duration = 2000
		const steps = 60
		const increment = target / steps
		let current = 0

		const timer = setInterval(() => {
			current += increment
			if (current >= target) {
				setCount(target)
				clearInterval(timer)
			} else {
				setCount(Math.floor(current))
			}
		}, duration / steps)

		return () => clearInterval(timer)
	}, [target])

	return (
		<span className="tabular-nums">
			{count.toLocaleString('fr-FR')}
			{suffix}
		</span>
	)
}

export default function HomePage() {
	return (
		<>
			<Header />
			<main className="flex-1 overflow-hidden">
				{/* Hero Section - Modern Minimal */}
				<section className="relative min-h-[85vh] flex items-center overflow-hidden">
					{/* Subtle grid background */}
					<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

					{/* Floating gradient orbs */}
					<div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-[var(--primary-green)]/15 to-transparent rounded-full blur-3xl" />
					<div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-[var(--accent-orange)]/10 to-transparent rounded-full blur-3xl" />

					<div className="container mx-auto px-4 py-20 relative z-10">
						<div className="max-w-5xl mx-auto">
							{/* Badge */}
							<div className="flex justify-center mb-8">
								<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border/50 text-sm">
									<span className="flex h-2 w-2 rounded-full bg-[var(--primary-green)] animate-pulse" />
									<span className="text-muted-foreground">
										La plateforme #1 en Cote d&apos;Ivoire
									</span>
								</div>
							</div>

							{/* Main headline */}
							<h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
								<span className="block">
									Perdre{' '}
									<span className="relative inline-block min-w-[180px] sm:min-w-[240px] md:min-w-[300px] text-left">
										<CyclingWord />
										<span className="absolute -bottom-1 left-0 right-0 h-3 bg-[var(--accent-orange)]/20 -skew-x-6 rounded" />
									</span>
								</span>
								<span className="block mt-2">
									n&apos;est plus{' '}
									<span className="text-[var(--primary-green)]">
										une fatalite
									</span>
								</span>
							</h1>

							{/* Subheadline */}
							<p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
								Signalez, recherchez et retrouvez vos objets perdus grace a
								notre communaute active dans toute la Cote d&apos;Ivoire.
							</p>

							{/* CTA Buttons */}
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
								<Button
									asChild
									size="lg"
									className="h-14 px-8 text-base bg-foreground text-background hover:bg-foreground/90 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
								>
									<Link href="/publier" className="flex items-center gap-2">
										Signaler un objet
										<ArrowRight className="w-4 h-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="h-14 px-8 text-base rounded-full border-2 transition-all duration-300 hover:scale-105"
								>
									<Link href="/annonces">Parcourir les annonces</Link>
								</Button>
							</div>

							{/* Stats inline */}
							<div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
								{[
									{ value: 2847, label: 'Objets retrouves', suffix: '+' },
									{ value: 12500, label: 'Utilisateurs', suffix: '+' },
									{ value: 95, label: 'Taux de succes', suffix: '%' },
								].map((stat, i) => (
									<div key={i} className="text-center">
										<div className="text-2xl md:text-3xl font-bold">
											<AnimatedCounter
												target={stat.value}
												suffix={stat.suffix}
											/>
										</div>
										<div className="text-sm text-muted-foreground">
											{stat.label}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Scroll hint */}
					<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
						<div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
							<div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
						</div>
					</div>
				</section>

				{/* Bento Grid Section */}
				<section className="py-20 md:py-28 bg-muted/30">
					<div className="container mx-auto px-4">
						<div className="text-center space-y-4 mb-16">
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
								Tout pour{' '}
								<span className="relative">
									retrouver
									<svg
										className="absolute -bottom-1 left-0 w-full h-2"
										viewBox="0 0 100 8"
										preserveAspectRatio="none"
									>
										<path
											d="M0 7 Q50 0 100 7"
											stroke="var(--primary-green)"
											strokeWidth="2"
											fill="none"
											strokeLinecap="round"
										/>
									</svg>
								</span>{' '}
								vos objets
							</h2>
							<p className="text-muted-foreground max-w-xl mx-auto">
								Une plateforme complete pour ne plus jamais perdre ce qui
								compte.
							</p>
						</div>

						{/* Modern Bento Grid */}
						<div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
							{/* Search - Large */}
							<div className="col-span-12 md:col-span-8 group">
								<div className="relative h-full min-h-[280px] rounded-3xl bg-[var(--primary-green)] p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--primary-green)]/20">
									<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
									<div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />

									<div className="relative z-10 h-full flex flex-col">
										<div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
											<Search className="w-7 h-7 text-white" />
										</div>
										<h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
											Recherche intelligente
										</h3>
										<p className="text-white/80 text-base max-w-md flex-1">
											Filtres avances par categorie, lieu et date pour trouver
											rapidement parmi des milliers d&apos;annonces.
										</p>
										<Link
											href="/annonces"
											className="inline-flex items-center gap-2 text-white font-medium mt-4 group/link"
										>
											Explorer
											<ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
										</Link>
									</div>
								</div>
							</div>

							{/* Stats card */}
							<div className="col-span-12 md:col-span-4 group">
								<div className="relative h-full min-h-[280px] rounded-3xl bg-background border border-border/50 p-6 overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg">
									<div className="h-full flex flex-col justify-between">
										<div>
											<div className="w-12 h-12 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
												<TrendingUp className="w-6 h-6 text-[var(--accent-orange)]" />
											</div>
											<h3 className="text-lg font-bold mb-1">27 villes</h3>
											<p className="text-sm text-muted-foreground">
												Couverture nationale
											</p>
										</div>
										<div className="space-y-3 mt-6">
											<div className="flex items-center gap-3">
												<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
													<div className="h-full w-[85%] rounded-full bg-[var(--primary-green)]" />
												</div>
												<span className="text-xs text-muted-foreground w-16">
													Abidjan
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
													<div className="h-full w-[45%] rounded-full bg-[var(--primary-green)]/70" />
												</div>
												<span className="text-xs text-muted-foreground w-16">
													Bouake
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
													<div className="h-full w-[30%] rounded-full bg-[var(--primary-green)]/50" />
												</div>
												<span className="text-xs text-muted-foreground w-16">
													Autres
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Notifications - Tall */}
							<div className="col-span-12 md:col-span-4 md:row-span-2 group">
								<div className="relative h-full min-h-[400px] rounded-3xl bg-background border border-border/50 p-6 overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg">
									<div className="h-full flex flex-col">
										<div className="w-12 h-12 rounded-xl bg-[var(--accent-orange)]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
											<Bell className="w-6 h-6 text-[var(--accent-orange)]" />
										</div>
										<h3 className="text-lg font-bold mb-1">
											Alertes en temps reel
										</h3>
										<p className="text-sm text-muted-foreground mb-6">
											Soyez notifie des qu&apos;un objet correspondant est
											signale.
										</p>

										{/* Notification stack */}
										<div className="flex-1 flex flex-col justify-end space-y-2">
											{[
												{
													title: 'iPhone 15 retrouve',
													loc: 'Cocody',
													time: '2 min',
													isNew: true,
												},
												{
													title: 'Cles de voiture',
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
													className={cn(
														'p-3 rounded-xl border bg-background transition-all duration-300',
														i === 0
															? 'shadow-sm border-[var(--primary-green)]/30'
															: 'opacity-60 scale-[0.98]',
													)}
												>
													<div className="flex items-start gap-2">
														{n.isNew && (
															<span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-green)] mt-1.5 animate-pulse shrink-0" />
														)}
														<div className="flex-1 min-w-0">
															<p className="text-sm font-medium truncate">
																{n.title}
															</p>
															<p className="text-xs text-muted-foreground">
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

							{/* Quick actions */}
							<div className="col-span-6 md:col-span-4 group">
								<div className="relative h-full min-h-[180px] rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-border/50 p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-500/30">
									<div className="h-full flex flex-col">
										<div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
											<Clock className="w-5 h-5 text-blue-600" />
										</div>
										<h3 className="text-base font-bold mb-1">2 minutes</h3>
										<p className="text-xs text-muted-foreground">
											Pour publier une annonce
										</p>
									</div>
								</div>
							</div>

							<div className="col-span-6 md:col-span-4 group">
								<div className="relative h-full min-h-[180px] rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-border/50 p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-purple-500/30">
									<div className="h-full flex flex-col">
										<div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
											<Users className="w-5 h-5 text-purple-600" />
										</div>
										<h3 className="text-base font-bold mb-1">12 500+</h3>
										<p className="text-xs text-muted-foreground">
											Membres actifs
										</p>
									</div>
								</div>
							</div>

							{/* QR Stickers - Wide */}
							<div className="col-span-12 md:col-span-8 group">
								<div className="relative h-full min-h-[220px] rounded-3xl bg-gradient-to-r from-[var(--accent-orange)]/10 via-[var(--accent-orange)]/5 to-transparent border border-border/50 p-8 overflow-hidden transition-all duration-300 hover:border-[var(--accent-orange)]/30 hover:shadow-lg">
									<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--accent-orange)]/10 rounded-full blur-2xl" />

									<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 h-full">
										<div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
											<QrCode className="w-8 h-8 text-[var(--accent-orange)]" />
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-bold mb-2">
												Stickers QR securises
											</h3>
											<p className="text-muted-foreground text-sm max-w-md mb-4">
												Protegez vos objets avec nos QR codes. Toute personne
												qui les trouve peut vous contacter sans voir vos
												informations.
											</p>
											<Link
												href="/stickers"
												className="inline-flex items-center gap-2 text-[var(--accent-orange)] font-medium text-sm group/link"
											>
												Decouvrir
												<ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
											</Link>
										</div>
									</div>
								</div>
							</div>

							{/* App card */}
							<div className="col-span-12 md:col-span-4 group">
								<Link href="/download" className="block h-full">
									<div className="relative h-full min-h-[220px] rounded-3xl bg-foreground p-6 overflow-hidden transition-all duration-300 hover:shadow-xl">
										<div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-green)]/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />

										<div className="relative z-10 h-full flex flex-col">
											<div className="flex items-center gap-2 mb-4">
												<Smartphone className="w-5 h-5 text-white/70" />
												<span className="text-xs font-medium text-[var(--primary-green)] bg-[var(--primary-green)]/20 px-2 py-0.5 rounded-full">
													Bientot
												</span>
											</div>
											<h3 className="text-lg font-bold text-white mb-1">
												App mobile
											</h3>
											<p className="text-sm text-white/60 flex-1">
												Scanner et signaler en un geste.
											</p>
											<div className="flex gap-3 mt-4">
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

				{/* How It Works */}
				<section className="py-20 md:py-28">
					<div className="container mx-auto px-4">
						<div className="text-center space-y-4 mb-16">
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] text-sm font-medium">
								<Sparkles className="w-4 h-4" />
								Comment ca marche
							</div>
							<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
								Retrouvez vos objets en{' '}
								<span className="text-[var(--primary-green)]">3 etapes</span>
							</h2>
							<p className="text-muted-foreground max-w-xl mx-auto">
								Un processus simple et efficace pour maximiser vos chances de
								retrouver ce qui vous appartient.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
							{[
								{
									step: '01',
									icon: Search,
									title: 'Signalez ou Recherchez',
									description:
										'Publiez une annonce pour un objet perdu ou recherchez parmi les objets retrouves par la communaute.',
									color: 'primary-green',
								},
								{
									step: '02',
									icon: Bell,
									title: 'Recevez des alertes',
									description:
										'Activez les notifications pour etre informe des qu&apos;un objet correspondant a votre recherche est signale.',
									color: 'accent-orange',
								},
								{
									step: '03',
									icon: CheckCircle,
									title: 'Recuperez votre objet',
									description:
										'Entrez en contact avec la personne et organisez la recuperation de votre objet en toute securite.',
									color: 'primary-green',
								},
							].map((item, index) => {
								const Icon = item.icon
								const colorVar = `var(--${item.color})`
								return (
									<div key={index} className="group relative">
										<div className="h-full rounded-3xl border border-border/50 bg-background p-8 transition-all duration-300 hover:border-border hover:shadow-xl hover:-translate-y-1">
											{/* Step number */}
											<span
												className="absolute -top-4 -left-2 text-7xl font-bold opacity-10 select-none"
												style={{ color: colorVar }}
											>
												{item.step}
											</span>

											<div className="relative z-10">
												<div
													className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
													style={{ backgroundColor: `${colorVar}15` }}
												>
													<Icon
														className="w-7 h-7"
														style={{ color: colorVar }}
													/>
												</div>
												<h3 className="text-xl font-bold mb-3">{item.title}</h3>
												<p className="text-muted-foreground leading-relaxed">
													{item.description}
												</p>
											</div>
										</div>

										{/* Connection arrow - desktop only */}
										{index < 2 && (
											<div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20">
												<ChevronRight className="w-6 h-6 text-muted-foreground/30" />
											</div>
										)}
									</div>
								)
							})}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="relative max-w-3xl mx-auto rounded-3xl bg-foreground p-10 md:p-14 overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-green)]/20 via-transparent to-[var(--accent-orange)]/10" />
							<div className="absolute -top-20 -right-20 w-60 h-60 bg-[var(--primary-green)]/20 rounded-full blur-3xl" />

							<div className="relative z-10 text-center space-y-6">
								<h2 className="text-2xl md:text-3xl font-bold text-white">
									Pret a retrouver ce qui vous appartient ?
								</h2>
								<p className="text-white/70 max-w-md mx-auto">
									Rejoignez des milliers d&apos;Ivoiriens qui utilisent
									RetrouveCI.
								</p>
								<div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
									<Button
										asChild
										size="lg"
										className="h-12 px-6 bg-white text-foreground hover:bg-white/90 rounded-full"
									>
										<Link href="/publier" className="flex items-center gap-2">
											Publier une annonce
											<ArrowRight className="w-4 h-4" />
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										size="lg"
										className="h-12 px-6 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
									>
										<Link href="/annonces">Voir les annonces</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
