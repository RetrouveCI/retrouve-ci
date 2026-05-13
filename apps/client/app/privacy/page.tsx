import type { Metadata } from 'next'
import Link from 'next/link'
import {
	ShieldCheck,
	Database,
	Eye,
	Share2,
	Lock,
	UserX,
	Cookie,
	Mail,
	ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
	title: 'Politique de confidentialité — RetrouveCI',
	description:
		'Découvrez comment RetrouveCI collecte, utilise et protège vos données personnelles.',
}

const sections = [
	{
		id: 'collecte',
		icon: Database,
		title: 'Données collectées',
		color: 'text-primary-green',
		bg: 'bg-primary-green/10',
		content: [
			"Lors de votre inscription, nous collectons votre numéro de téléphone et votre nom d'affichage. Ces informations sont indispensables au fonctionnement du service.",
			"Lors de la publication d'annonces, nous enregistrons le titre, la description, la localisation approximative, la catégorie et la date de publication de l'objet.",
			"Nous collectons également automatiquement des données techniques : adresse IP, type de navigateur, système d'exploitation et pages visitées, à des fins statistiques et de sécurité.",
		],
	},
	{
		id: 'utilisation',
		icon: Eye,
		title: 'Utilisation des données',
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
		content: [
			'Vos données sont utilisées pour faire fonctionner la plateforme : afficher vos annonces, gérer vos stickers QR et faciliter le contact entre utilisateurs.',
			'Nous pouvons utiliser votre adresse email ou numéro de téléphone pour vous envoyer des notifications relatives à vos annonces (correspondance trouvée, messages reçus).',
			'Les données agrégées et anonymisées peuvent être utilisées pour améliorer nos services, sans jamais permettre de vous identifier individuellement.',
		],
	},
	{
		id: 'partage',
		icon: Share2,
		title: 'Partage des données',
		color: 'text-accent-orange',
		bg: 'bg-accent-orange/10',
		content: [
			"Votre numéro de téléphone n'est jamais affiché publiquement. Il est partagé uniquement si vous choisissez explicitement de le communiquer via WhatsApp depuis une annonce.",
			'Nous ne vendons, ne louons et ne partageons pas vos données personnelles avec des tiers à des fins commerciales.',
			"Dans le cas où la loi ivoirienne l'exige, nous pourrions être contraints de partager certaines informations avec les autorités compétentes.",
		],
	},
	{
		id: 'securite',
		icon: Lock,
		title: 'Sécurité des données',
		color: 'text-violet-500',
		bg: 'bg-violet-500/10',
		content: [
			'Toutes les communications entre votre appareil et nos serveurs sont chiffrées via le protocole HTTPS/TLS.',
			'Les mots de passe sont stockés sous forme de hash sécurisé (bcrypt) et ne sont jamais conservés en clair dans nos bases de données.',
			'Nous effectuons des audits de sécurité réguliers et mettons à jour nos systèmes pour protéger vos données contre les accès non autorisés.',
		],
	},
	{
		id: 'droits',
		icon: UserX,
		title: 'Vos droits',
		color: 'text-rose-500',
		bg: 'bg-rose-500/10',
		content: [
			"Conformément aux lois applicables, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.",
			"Vous pouvez demander la suppression de votre compte et de l'ensemble de vos données à tout moment depuis les paramètres de votre compte ou en nous contactant directement.",
			"Vous avez également le droit de vous opposer au traitement de vos données à des fins de communication ou d'analyse.",
		],
	},
	{
		id: 'conservation',
		icon: ShieldCheck,
		title: 'Conservation des données',
		color: 'text-teal-500',
		bg: 'bg-teal-500/10',
		content: [
			'Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données personnelles sont effacées dans un délai de 30 jours.',
			"Les annonces supprimées sont retirées de l'affichage public immédiatement mais peuvent être conservées dans nos logs pendant 90 jours à des fins de sécurité.",
			'Les données techniques anonymisées peuvent être conservées indéfiniment à des fins statistiques.',
		],
	},
	{
		id: 'cookies',
		icon: Cookie,
		title: 'Cookies',
		color: 'text-amber-500',
		bg: 'bg-amber-500/10',
		content: [
			'RetrouveCI utilise des cookies essentiels au fonctionnement du service (session utilisateur, préférences).',
			"Des cookies analytiques anonymes peuvent être utilisés pour comprendre comment les utilisateurs naviguent sur la plateforme, sans jamais collecter d'informations personnelles identifiables.",
			'Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du service.',
		],
	},
]

export default function PrivacyPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
					<div className="bg-primary-green/6 absolute -top-24 right-0 h-80 w-80 rounded-full blur-3xl" />
					<div className="relative container mx-auto px-4 py-14 md:py-20">
						<div className="max-w-2xl">
							<div className="border-primary-green/20 bg-primary-green/10 text-primary-green mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
								<ShieldCheck className="h-3.5 w-3.5" />
								Dernière mise à jour : avril 2025
							</div>
							<h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
								Politique de confidentialité
							</h1>
							<p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
								La protection de vos données personnelles est une priorité
								absolue pour RetrouveCI. Cette politique explique comment nous
								collectons, utilisons et protégeons vos informations.
							</p>
						</div>
					</div>
				</section>

				{/* Trust bento row */}
				<section className="border-b py-8">
					<div className="container mx-auto px-4">
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="bg-primary-green flex items-center gap-4 rounded-2xl border p-6 text-white">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
									<Lock className="h-5 w-5" />
								</div>
								<div>
									<p className="font-bold">Chiffrement HTTPS</p>
									<p className="text-sm text-white/70">
										Toutes vos données sont chiffrées
									</p>
								</div>
							</div>
							<div className="bg-background flex items-center gap-4 rounded-2xl border p-6">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
									<Eye className="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<p className="font-bold">Aucune revente</p>
									<p className="text-muted-foreground text-sm">
										Vos données ne sont jamais vendues
									</p>
								</div>
							</div>
							<div className="bg-background flex items-center gap-4 rounded-2xl border p-6">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
									<UserX className="h-5 w-5 text-rose-500" />
								</div>
								<div>
									<p className="font-bold">Suppression sur demande</p>
									<p className="text-muted-foreground text-sm">
										Effacement complet en 30 jours
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Quick nav chips */}
				<section className="border-b py-6">
					<div className="container mx-auto px-4">
						<div className="flex flex-wrap gap-2">
							{sections.map(s => {
								const Icon = s.icon
								return (
									<a
										key={s.id}
										href={`#${s.id}`}
										className="bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
									>
										<Icon className={`h-3.5 w-3.5 ${s.color}`} />
										{s.title}
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
							{/* Sticky sidebar */}
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
										<div className="bg-primary-green/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
											<Mail className="text-primary-green h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-semibold">
												Exercer vos droits
											</p>
											<p className="text-muted-foreground text-xs">
												Contactez-nous pour toute demande relative à vos
												données.
											</p>
										</div>
									</div>
									<Link
										href="/contact"
										className="bg-primary-green hover:bg-primary-green-dark inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors"
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
