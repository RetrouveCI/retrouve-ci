import type { Metadata } from 'next'
import Link from 'next/link'
import {
	AlertCircle,
	CheckCircle,
	ArrowRight,
	Shield,
	Clock,
	MapPin,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
	title: 'Publier une annonce',
	description:
		"Publiez une annonce pour un objet perdu ou retrouvé en Côte d'Ivoire.",
}

export default function PublierPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="bg-(primary-green)/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
						<div className="bg-(accent-orange)/5 absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl" />
					</div>
					<div className="relative container mx-auto px-4 pt-12 pb-10 text-center">
						<div className="bg-muted text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
							<Clock className="h-3.5 w-3.5" />
							Publication en moins de 2 minutes
						</div>
						<h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
							Que souhaitez-vous
							<br className="hidden sm:block" /> signaler ?
						</h1>
						<p className="text-muted-foreground mx-auto max-w-md text-base md:text-lg">
							Choisissez le type d&apos;annonce à publier pour commencer.
						</p>
					</div>
				</section>

				{/* Cards */}
				<section className="py-10 md:py-16">
					<div className="container mx-auto px-4">
						<div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
							{/* Lost */}
							<Link href="/publier/perdu" className="group block">
								<div className="bg-background group-hover:border-(accent-orange)/40 relative h-full overflow-hidden rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
									{/* Top accent bar */}
									<div className="bg-(accent-orange) h-1.5 w-full" />
									<div className="p-8">
										{/* Icon */}
										<div className="bg-(accent-orange)/10 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
											<AlertCircle className="text-(accent-orange) h-7 w-7" />
										</div>
										<h2 className="mb-2 text-2xl font-bold">
											J&apos;ai perdu un objet
										</h2>
										<p className="text-muted-foreground mb-6 leading-relaxed">
											Signalez votre perte et laissez la communauté vous aider à
											le retrouver.
										</p>
										<ul className="text-muted-foreground mb-8 space-y-2 text-sm">
											<li className="flex items-center gap-2">
												<span className="bg-(accent-orange) h-1.5 w-1.5 rounded-full" />
												Visible instantanément
											</li>
											<li className="flex items-center gap-2">
												<span className="bg-(accent-orange) h-1.5 w-1.5 rounded-full" />
												Notifications si quelqu&apos;un retrouve votre objet
											</li>
											<li className="flex items-center gap-2">
												<span className="bg-(accent-orange) h-1.5 w-1.5 rounded-full" />
												Contact sécurisé via WhatsApp
											</li>
										</ul>
										<div className="text-(accent-orange) flex items-center gap-2 font-semibold">
											Publier un objet perdu
											<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
										</div>
									</div>
								</div>
							</Link>

							{/* Found */}
							<Link href="/publier/retrouve" className="group block">
								<div className="bg-background group-hover:border-(primary-green)/40 relative h-full overflow-hidden rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
									{/* Top accent bar */}
									<div className="bg-(primary-green) h-1.5 w-full" />
									<div className="p-8">
										{/* Icon */}
										<div className="bg-(primary-green)/10 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
											<CheckCircle className="text-(primary-green) h-7 w-7" />
										</div>
										<h2 className="mb-2 text-2xl font-bold">
											J&apos;ai retrouvé un objet
										</h2>
										<p className="text-muted-foreground mb-6 leading-relaxed">
											Aidez le propriétaire à récupérer son bien en publiant
											votre trouvaille.
										</p>
										<ul className="text-muted-foreground mb-8 space-y-2 text-sm">
											<li className="flex items-center gap-2">
												<span className="bg-(primary-green) h-1.5 w-1.5 rounded-full" />
												Simple et rapide à remplir
											</li>
											<li className="flex items-center gap-2">
												<span className="bg-(primary-green) h-1.5 w-1.5 rounded-full" />
												Le propriétaire vous contactera directement
											</li>
											<li className="flex items-center gap-2">
												<span className="bg-(primary-green) h-1.5 w-1.5 rounded-full" />
												Votre numéro reste privé
											</li>
										</ul>
										<div className="text-(primary-green) flex items-center gap-2 font-semibold">
											Publier un objet retrouvé
											<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
										</div>
									</div>
								</div>
							</Link>
						</div>

						{/* Trust badges */}
						<div className="text-muted-foreground mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-6 text-sm">
							<span className="flex items-center gap-1.5">
								<Shield className="text-(primary-green) h-4 w-4" />
								Données protégées
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="text-(primary-green) h-4 w-4" />
								Publication instantanée
							</span>
							<span className="flex items-center gap-1.5">
								<MapPin className="text-(primary-green) h-4 w-4" />
								Toute la Côte d&apos;Ivoire
							</span>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
