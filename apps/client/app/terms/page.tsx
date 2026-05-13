import type { Metadata } from 'next'
import Link from 'next/link'
import {
	FileText,
	Users,
	AlertTriangle,
	Ban,
	Scale,
	RefreshCw,
	Mail,
	ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
	title: "Conditions d'utilisation — RetrouveCI",
	description:
		"Consultez les conditions générales d'utilisation de la plateforme RetrouveCI.",
}

const sections = [
	{
		id: 'acceptation',
		icon: FileText,
		title: 'Acceptation des conditions',
		color: 'text-(primary-green)',
		bg: 'bg-(primary-green)/10',
		content: [
			"En accédant à RetrouveCI et en utilisant nos services, vous acceptez pleinement et sans réserve les présentes conditions générales d'utilisation.",
			"Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser la plateforme. RetrouveCI se réserve le droit de modifier ces conditions à tout moment.",
			"L'utilisation continue du service après modification vaut acceptation des nouvelles conditions.",
		],
	},
	{
		id: 'compte',
		icon: Users,
		title: 'Comptes utilisateurs',
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
		content: [
			'Pour publier une annonce ou commander des stickers QR, vous devez créer un compte en fournissant un numéro de téléphone valide.',
			"Vous êtes responsable de la confidentialité de votre mot de passe et de l'ensemble des activités effectuées depuis votre compte.",
			'Toute information fournie doit être exacte, complète et à jour. RetrouveCI se réserve le droit de suspendre tout compte contenant des informations frauduleuses.',
		],
	},
	{
		id: 'contenu',
		icon: AlertTriangle,
		title: 'Contenu des annonces',
		color: 'text-(accent-orange)',
		bg: 'bg-(accent-orange)/10',
		content: [
			'Les annonces publiées doivent correspondre à de véritables objets perdus ou retrouvés sur le territoire ivoirien.',
			"Toute annonce frauduleuse, trompeuse ou visant à escroquer d'autres utilisateurs est strictement interdite et entraînera la suspension immédiate du compte.",
			'RetrouveCI se réserve le droit de supprimer toute annonce jugée inappropriée, sans préavis ni justification.',
		],
	},
	{
		id: 'interdictions',
		icon: Ban,
		title: 'Comportements interdits',
		color: 'text-rose-500',
		bg: 'bg-rose-500/10',
		content: [
			"Il est formellement interdit d'utiliser RetrouveCI à des fins commerciales non autorisées, de spam, de harcèlement ou de toute activité illégale.",
			'La publication de contenu offensant, discriminatoire, obscène ou portant atteinte aux droits de tiers est prohibée.',
			"Le scraping automatisé, l'accès non autorisé aux systèmes, ou toute tentative de contournement des mesures de sécurité sont strictement prohibés.",
		],
	},
	{
		id: 'responsabilite',
		icon: Scale,
		title: 'Limitation de responsabilité',
		color: 'text-violet-500',
		bg: 'bg-violet-500/10',
		content: [
			"RetrouveCI agit en qualité d'intermédiaire et ne peut être tenu responsable des échanges entre utilisateurs, ni de la véracité des informations publiées.",
			"La plateforme ne garantit pas la récupération des objets signalés. Toute transaction ou remise d'objet se fait sous la seule responsabilité des parties concernées.",
			"En aucun cas RetrouveCI ne pourra être tenu responsable de dommages indirects, accessoires ou consécutifs liés à l'utilisation du service.",
		],
	},
	{
		id: 'modifications',
		icon: RefreshCw,
		title: 'Modifications du service',
		color: 'text-teal-500',
		bg: 'bg-teal-500/10',
		content: [
			'RetrouveCI se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, avec ou sans préavis.',
			'Des fonctionnalités peuvent être ajoutées, modifiées ou supprimées selon les besoins de la plateforme et les retours de la communauté.',
			"Les présentes conditions sont régies par le droit ivoirien. Tout litige sera soumis à la compétence exclusive des tribunaux d'Abidjan.",
		],
	},
]

export default function TermsPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
					<div className="relative container mx-auto px-4 py-14 md:py-20">
						<div className="max-w-2xl">
							<div className="bg-muted text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
								<FileText className="h-3.5 w-3.5" />
								Dernière mise à jour : avril 2025
							</div>
							<h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
								{"Conditions d'utilisation"}
							</h1>
							<p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
								{
									"Veuillez lire attentivement ces conditions avant d'utiliser nos services. Elles définissent vos droits et obligations en tant qu'utilisateur de RetrouveCI."
								}
							</p>
						</div>
					</div>
				</section>

				{/* Summary bento */}
				<section className="border-b py-10">
					<div className="container mx-auto px-4">
						<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
							{sections.map(s => {
								const Icon = s.icon
								return (
									<a
										key={s.id}
										href={`#${s.id}`}
										className="bg-background group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-transform duration-200 hover:-translate-y-1"
									>
										<div
											className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}
										>
											<Icon className={`h-4 w-4 ${s.color}`} />
										</div>
										<span className="text-xs leading-snug font-medium">
											{s.title}
										</span>
									</a>
								)
							})}
						</div>
					</div>
				</section>

				{/* Content */}
				<section className="py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="grid gap-4 md:grid-cols-12">
							{/* Sticky sidebar on desktop */}
							<aside className="hidden md:col-span-3 md:block">
								<div className="bg-background sticky top-24 space-y-1 rounded-2xl border p-5">
									<p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
										Sommaire
									</p>
									{sections.map((s, i) => (
										<a
											key={s.id}
											href={`#${s.id}`}
											className="text-muted-foreground hover:text-foreground flex items-center gap-2 py-1 text-sm transition-colors"
										>
											<span className="text-muted-foreground/50 font-mono text-xs">
												{String(i + 1).padStart(2, '0')}
											</span>
											{s.title}
										</a>
									))}
								</div>
							</aside>

							{/* Sections */}
							<div className="space-y-4 md:col-span-9">
								{sections.map(s => {
									const Icon = s.icon
									return (
										<div
											key={s.id}
											id={s.id}
											className="bg-background scroll-mt-24 rounded-2xl border p-7"
										>
											<div className="mb-5 flex items-center gap-3">
												<div
													className={`h-10 w-10 rounded-xl ${s.bg} flex shrink-0 items-center justify-center`}
												>
													<Icon className={`h-5 w-5 ${s.color}`} />
												</div>
												<h2 className="text-xl font-bold">{s.title}</h2>
											</div>
											<div className="space-y-3">
												{s.content.map((para, i) => (
													<p
														key={i}
														className="text-muted-foreground text-sm leading-relaxed"
													>
														{para}
													</p>
												))}
											</div>
										</div>
									)
								})}

								{/* Contact CTA */}
								<div className="bg-muted/30 flex flex-col items-start justify-between gap-4 rounded-2xl border p-7 sm:flex-row sm:items-center">
									<div className="flex items-center gap-3">
										<div className="bg-(primary-green)/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
											<Mail className="text-(primary-green) h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-semibold">
												Une question sur ces conditions ?
											</p>
											<p className="text-muted-foreground text-xs">
												Notre équipe vous répond sous 24h.
											</p>
										</div>
									</div>
									<Link
										href="/contact"
										className="bg-(primary-green) hover:bg-(primary-green-dark) inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors"
									>
										Nous contacter
										<ArrowRight className="h-4 w-4" />
									</Link>
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
