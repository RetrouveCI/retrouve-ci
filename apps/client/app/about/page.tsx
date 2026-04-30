import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
	Heart,
	Users,
	MapPin,
	ShieldCheck,
	Zap,
	QrCode,
	ArrowRight,
	Globe,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
	title: 'À propos — RetrouveCI',
	description:
		"Découvrez la mission, les valeurs et l'équipe derrière RetrouveCI, la plateforme des objets perdus et retrouvés en Côte d'Ivoire.",
}

const stats = [
	{ value: '2 000+', label: 'Objets retrouvés' },
	{ value: '15 000+', label: 'Utilisateurs actifs' },
	{ value: '26', label: 'Villes couvertes' },
	{ value: '94%', label: 'Taux de satisfaction' },
]

const values = [
	{
		icon: Heart,
		title: 'Solidarité',
		description:
			'Nous croyons que chaque objet retrouvé est un acte de générosité envers un inconnu.',
		color: 'text-rose-500',
		bg: 'bg-rose-500/10',
	},
	{
		icon: ShieldCheck,
		title: 'Confiance',
		description:
			'La sécurité des données et la confidentialité de nos utilisateurs sont au cœur de tout ce que nous faisons.',
		color: 'text-(primary-green)',
		bg: 'bg-(primary-green)/10',
	},
	{
		icon: Zap,
		title: 'Simplicité',
		description:
			'Une interface pensée pour tous, accessible même sans expertise technologique.',
		color: 'text-(accent-orange)',
		bg: 'bg-(accent-orange)/10',
	},
	{
		icon: Globe,
		title: 'Inclusion',
		description:
			"RetrouveCI est conçu pour chaque habitant de Côte d'Ivoire, en ville comme en région.",
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
	},
]

const team = [
	{ name: 'Konan Yao', role: 'Fondateur & CEO', initials: 'KY' },
	{ name: 'Amina Traoré', role: 'Directrice Produit', initials: 'AT' },
	{ name: 'Brice Assi', role: 'Lead Développeur', initials: 'BA' },
	{ name: 'Fatou Koné', role: 'Community Manager', initials: 'FK' },
]

export default function AboutPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
					<div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-(primary-green)/8 blur-3xl" />
					<div className="relative container mx-auto px-4 py-14 md:py-20">
						<div className="max-w-2xl">
							<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(primary-green)/20 bg-(primary-green)/10 px-3 py-1 text-xs font-semibold text-(primary-green)">
								<Heart className="h-3.5 w-3.5" />
								Notre histoire
							</div>
							<h1 className="mb-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
								Retrouver ce qui compte,{' '}
								<span className="text-(primary-green)">ensemble</span>
							</h1>
							<p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
								RetrouveCI est née d&apos;une conviction simple : en Côte
								d&apos;Ivoire, la solidarité peut transformer la perte en
								retrouvaille. Notre plateforme connecte les personnes ayant
								perdu un objet avec celles qui l&apos;ont trouvé.
							</p>
						</div>
					</div>
				</section>

				{/* Stats bar */}
				<section className="bg-muted/30 border-b">
					<div className="container mx-auto px-4 py-6">
						<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
							{stats.map(s => (
								<div key={s.label} className="text-center">
									<p className="text-2xl font-bold text-(primary-green) md:text-3xl">
										{s.value}
									</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{s.label}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Mission + Bento */}
				<section className="py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="grid gap-4 md:grid-cols-12">
							{/* Mission card — large */}
							<div className="bg-background flex min-h-64 flex-col justify-between rounded-2xl border p-8 md:col-span-7">
								<div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-(primary-green)/10">
									<Heart className="h-6 w-6 text-(primary-green)" />
								</div>
								<div>
									<h2 className="mb-3 text-2xl font-bold">Notre mission</h2>
									<p className="text-muted-foreground leading-relaxed">
										Réduire la perte définitive d&apos;objets en Côte
										d&apos;Ivoire grâce à une plateforme communautaire moderne,
										accessible et fiable. Chaque annonce publiée est une chance
										de redonner un objet à son propriétaire.
									</p>
								</div>
							</div>

							{/* Founded card */}
							<div className="flex min-h-48 flex-col justify-between rounded-2xl border bg-(primary-green) p-8 text-white md:col-span-5">
								<p className="text-sm font-medium tracking-wider text-white/70 uppercase">
									Fondée en
								</p>
								<div>
									<p className="text-6xl font-bold">2024</p>
									<p className="mt-1 text-sm text-white/80">
										Abidjan, Côte d&apos;Ivoire
									</p>
								</div>
							</div>

							{/* QR Technology card */}
							<div className="bg-background flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-(accent-orange)/10">
									<QrCode className="h-6 w-6 text-(accent-orange)" />
								</div>
								<div>
									<h3 className="mb-1.5 text-lg font-bold">Stickers QR</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										Notre technologie de stickers QR permet d&apos;identifier
										instantanément l&apos;objet et de contacter son propriétaire
										sans jamais exposer ses données.
									</p>
								</div>
							</div>

							{/* Coverage card */}
							<div className="bg-background flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
									<MapPin className="h-6 w-6 text-blue-500" />
								</div>
								<div>
									<h3 className="mb-1.5 text-lg font-bold">
										Couverture nationale
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										Présent dans 26 villes ivoiriennes, de l&apos;Abidjan
										cosmopolite aux villes de l&apos;intérieur comme Bouaké,
										Yamoussoukro et San-Pédro.
									</p>
								</div>
							</div>

							{/* Community card */}
							<div className="bg-muted/30 flex flex-col gap-4 rounded-2xl border p-8 md:col-span-4">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
									<Users className="h-6 w-6 text-rose-500" />
								</div>
								<div>
									<h3 className="mb-1.5 text-lg font-bold">
										Communauté active
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										Plus de 15 000 utilisateurs font confiance à RetrouveCI
										chaque mois pour signaler, chercher et retrouver leurs
										objets.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Values */}
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

				{/* Team */}
				<section className="border-t py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="mb-10 max-w-xl">
							<h2 className="mb-3 text-3xl font-bold">L&apos;équipe</h2>
							<p className="text-muted-foreground">
								Des passionnés qui croient en la puissance de la communauté.
							</p>
						</div>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{team.map(member => (
								<div
									key={member.name}
									className="bg-background group flex flex-col items-center rounded-2xl border p-6 text-center transition-transform duration-300 hover:-translate-y-1"
								>
									<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(primary-green)/10 transition-colors group-hover:bg-(primary-green)/20">
										<span className="text-xl font-bold text-(primary-green)">
											{member.initials}
										</span>
									</div>
									<p className="font-semibold">{member.name}</p>
									<p className="text-muted-foreground mt-0.5 text-sm">
										{member.role}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="border-t py-12">
					<div className="container mx-auto px-4">
						<div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-(primary-green) p-8 text-white md:flex-row md:p-12">
							<div>
								<h2 className="mb-2 text-2xl font-bold md:text-3xl">
									Rejoignez la communauté
								</h2>
								<p className="text-white/80">
									Publiez votre première annonce gratuitement dès
									aujourd&apos;hui.
								</p>
							</div>
							<Link
								href="/publier"
								className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-(primary-green) transition-colors hover:bg-white/90"
							>
								Publier une annonce
								<ArrowRight className="h-4 w-4" />
							</Link>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
