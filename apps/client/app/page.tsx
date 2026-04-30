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
				setIndex(i => (i + 1) % CYCLING_WORDS.length)
				setIsVisible(true)
			}, 300)
		}, 2500)
		return () => clearInterval(interval)
	}, [])

	return (
		<span
			className={cn(
				'inline-block transition-all duration-300 ease-out',
				isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
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
				<section className="relative flex min-h-[85vh] items-center overflow-hidden">
					{/* Subtle grid background */}
					<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

					{/* Floating gradient orbs */}
					<div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[var(--primary-green)]/15 to-transparent blur-3xl" />
					<div className="absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-[var(--accent-orange)]/10 to-transparent blur-3xl" />

					<div className="relative z-10 container mx-auto px-4 py-20">
						<div className="mx-auto max-w-5xl">
							{/* Badge */}
							<div className="mb-8 flex justify-center">
								<div className="bg-foreground/5 border-border/50 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
									<span className="flex h-2 w-2 animate-pulse rounded-full bg-[var(--primary-green)]" />
									<span className="text-muted-foreground">
										La plateforme #1 en Cote d&apos;Ivoire
									</span>
								</div>
							</div>

							{/* Main headline */}
							<h1 className="mb-6 text-center text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
								<span className="block">
									Perdre{' '}
									<span className="relative inline-block min-w-[180px] text-left sm:min-w-[240px] md:min-w-[300px]">
										<CyclingWord />
										<span className="absolute right-0 -bottom-1 left-0 h-3 -skew-x-6 rounded bg-[var(--accent-orange)]/20" />
									</span>
								</span>
								<span className="mt-2 block">
									n&apos;est plus{' '}
									<span className="text-[var(--primary-green)]">
										une fatalite
									</span>
								</span>
							</h1>

							{/* Subheadline */}
							<p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-center text-lg md:text-xl">
								Signalez, recherchez et retrouvez vos objets perdus grace a
								notre communaute active dans toute la Cote d&apos;Ivoire.
							</p>

							{/* CTA Buttons */}
							<div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Button
									asChild
									size="lg"
									className="bg-foreground text-background hover:bg-foreground/90 h-14 rounded-full px-8 text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
								>
									<Link href="/publier" className="flex items-center gap-2">
										Signaler un objet
										<ArrowRight className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="h-14 rounded-full border-2 px-8 text-base transition-all duration-300 hover:scale-105"
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
										<div className="text-2xl font-bold md:text-3xl">
											<AnimatedCounter
												target={stat.value}
												suffix={stat.suffix}
											/>
										</div>
										<div className="text-muted-foreground text-sm">
											{stat.label}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Scroll hint */}
					<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
						<div className="border-muted-foreground/30 flex h-10 w-6 justify-center rounded-full border-2 pt-2">
							<div className="bg-muted-foreground/50 h-2 w-1 animate-bounce rounded-full" />
						</div>
					</div>
				</section>

				{/* Bento Grid Section */}
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
											stroke="var(--primary-green)"
											strokeWidth="2"
											fill="none"
											strokeLinecap="round"
										/>
									</svg>
								</span>{' '}
								vos objets
							</h2>
							<p className="text-muted-foreground mx-auto max-w-xl">
								Une plateforme complete pour ne plus jamais perdre ce qui
								compte.
							</p>
						</div>

						{/* Modern Bento Grid */}
						<div className="mx-auto grid max-w-6xl grid-cols-12 gap-4">
							{/* Search - Large */}
							<div className="group col-span-12 md:col-span-8">
								<div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl bg-[var(--primary-green)] p-8 transition-all duration-500 hover:shadow-[var(--primary-green)]/20 hover:shadow-2xl">
									<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
									<div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

									<div className="relative z-10 flex h-full flex-col">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
											<Search className="h-7 w-7 text-white" />
										</div>
										<h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
											Recherche intelligente
										</h3>
										<p className="max-w-md flex-1 text-base text-white/80">
											Filtres avances par categorie, lieu et date pour trouver
											rapidement parmi des milliers d&apos;annonces.
										</p>
										<Link
											href="/annonces"
											className="group/link mt-4 inline-flex items-center gap-2 font-medium text-white"
										>
											Explorer
											<ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
										</Link>
									</div>
								</div>
							</div>

							{/* Stats card */}
							<div className="group col-span-12 md:col-span-4">
								<div className="bg-background border-border/50 hover:border-border relative h-full min-h-[280px] overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg">
									<div className="flex h-full flex-col justify-between">
										<div>
											<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10 transition-transform group-hover:scale-110">
												<TrendingUp className="h-6 w-6 text-[var(--accent-orange)]" />
											</div>
											<h3 className="mb-1 text-lg font-bold">27 villes</h3>
											<p className="text-muted-foreground text-sm">
												Couverture nationale
											</p>
										</div>
										<div className="mt-6 space-y-3">
											<div className="flex items-center gap-3">
												<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
													<div className="h-full w-[85%] rounded-full bg-[var(--primary-green)]" />
												</div>
												<span className="text-muted-foreground w-16 text-xs">
													Abidjan
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
													<div className="h-full w-[45%] rounded-full bg-[var(--primary-green)]/70" />
												</div>
												<span className="text-muted-foreground w-16 text-xs">
													Bouake
												</span>
											</div>
											<div className="flex items-center gap-3">
												<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
													<div className="h-full w-[30%] rounded-full bg-[var(--primary-green)]/50" />
												</div>
												<span className="text-muted-foreground w-16 text-xs">
													Autres
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Notifications - Tall */}
							<div className="group col-span-12 md:col-span-4 md:row-span-2">
								<div className="bg-background border-border/50 hover:border-border relative h-full min-h-[400px] overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg">
									<div className="flex h-full flex-col">
										<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10 transition-transform group-hover:scale-110">
											<Bell className="h-6 w-6 text-[var(--accent-orange)]" />
										</div>
										<h3 className="mb-1 text-lg font-bold">
											Alertes en temps reel
										</h3>
										<p className="text-muted-foreground mb-6 text-sm">
											Soyez notifie des qu&apos;un objet correspondant est
											signale.
										</p>

										{/* Notification stack */}
										<div className="flex flex-1 flex-col justify-end space-y-2">
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
														'bg-background rounded-xl border p-3 transition-all duration-300',
														i === 0
															? 'border-[var(--primary-green)]/30 shadow-sm'
															: 'scale-[0.98] opacity-60',
													)}
												>
													<div className="flex items-start gap-2">
														{n.isNew && (
															<span className="mt-1.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--primary-green)]" />
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

							{/* Quick actions */}
							<div className="group col-span-6 md:col-span-4">
								<div className="border-border/50 relative h-full min-h-[180px] overflow-hidden rounded-3xl border bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg">
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
								<div className="border-border/50 relative h-full min-h-[180px] overflow-hidden rounded-3xl border bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg">
									<div className="flex h-full flex-col">
										<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 transition-transform group-hover:scale-110">
											<Users className="h-5 w-5 text-purple-600" />
										</div>
										<h3 className="mb-1 text-base font-bold">12 500+</h3>
										<p className="text-muted-foreground text-xs">
											Membres actifs
										</p>
									</div>
								</div>
							</div>

							{/* QR Stickers - Wide */}
							<div className="group col-span-12 md:col-span-8">
								<div className="border-border/50 relative h-full min-h-[220px] overflow-hidden rounded-3xl border bg-gradient-to-r from-[var(--accent-orange)]/10 via-[var(--accent-orange)]/5 to-transparent p-8 transition-all duration-300 hover:border-[var(--accent-orange)]/30 hover:shadow-lg">
									<div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-[var(--accent-orange)]/10 blur-2xl" />

									<div className="relative z-10 flex h-full flex-col items-start gap-6 md:flex-row md:items-center">
										<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-orange)]/10 transition-transform group-hover:scale-110">
											<QrCode className="h-8 w-8 text-[var(--accent-orange)]" />
										</div>
										<div className="flex-1">
											<h3 className="mb-2 text-xl font-bold">
												Stickers QR securises
											</h3>
											<p className="text-muted-foreground mb-4 max-w-md text-sm">
												Protegez vos objets avec nos QR codes. Toute personne
												qui les trouve peut vous contacter sans voir vos
												informations.
											</p>
											<Link
												href="/stickers"
												className="group/link inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-orange)]"
											>
												Decouvrir
												<ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
											</Link>
										</div>
									</div>
								</div>
							</div>

							{/* App card */}
							<div className="group col-span-12 md:col-span-4">
								<Link href="/download" className="block h-full">
									<div className="bg-foreground relative h-full min-h-[220px] overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:shadow-xl">
										<div className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary-green)]/20 blur-2xl" />

										<div className="relative z-10 flex h-full flex-col">
											<div className="mb-4 flex items-center gap-2">
												<Smartphone className="h-5 w-5 text-white/70" />
												<span className="rounded-full bg-[var(--primary-green)]/20 px-2 py-0.5 text-xs font-medium text-[var(--primary-green)]">
													Bientot
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

				{/* How It Works */}
				<section className="py-20 md:py-28">
					<div className="container mx-auto px-4">
						<div className="mb-16 space-y-4 text-center">
							<div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-green)]/10 px-3 py-1.5 text-sm font-medium text-[var(--primary-green)]">
								<Sparkles className="h-4 w-4" />
								Comment ca marche
							</div>
							<h2 className="text-3xl font-bold tracking-tight md:text-4xl">
								Retrouvez vos objets en{' '}
								<span className="text-[var(--primary-green)]">3 etapes</span>
							</h2>
							<p className="text-muted-foreground mx-auto max-w-xl">
								Un processus simple et efficace pour maximiser vos chances de
								retrouver ce qui vous appartient.
							</p>
						</div>

						<div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
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
										<div className="border-border/50 bg-background hover:border-border h-full rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
											{/* Step number */}
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
													<Icon
														className="h-7 w-7"
														style={{ color: colorVar }}
													/>
												</div>
												<h3 className="mb-3 text-xl font-bold">{item.title}</h3>
												<p className="text-muted-foreground leading-relaxed">
													{item.description}
												</p>
											</div>
										</div>

										{/* Connection arrow - desktop only */}
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

				{/* CTA Section */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="bg-foreground relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-10 md:p-14">
							<div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-green)]/20 via-transparent to-[var(--accent-orange)]/10" />
							<div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--primary-green)]/20 blur-3xl" />

							<div className="relative z-10 space-y-6 text-center">
								<h2 className="text-2xl font-bold text-white md:text-3xl">
									Pret a retrouver ce qui vous appartient ?
								</h2>
								<p className="mx-auto max-w-md text-white/70">
									Rejoignez des milliers d&apos;Ivoiriens qui utilisent
									RetrouveCI.
								</p>
								<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
									<Button
										asChild
										size="lg"
										className="text-foreground h-12 rounded-full bg-white px-6 hover:bg-white/90"
									>
										<Link href="/publier" className="flex items-center gap-2">
											Publier une annonce
											<ArrowRight className="h-4 w-4" />
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										size="lg"
										className="h-12 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
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
