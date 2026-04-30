import type { Metadata } from 'next'
import Link from 'next/link'
import {
	Package,
	CheckCircle,
	Shield,
	Heart,
	Lock,
	MessageCircle,
	Power,
	Smartphone,
	RefreshCw,
	QrCode,
	Wallet,
	Key,
	Briefcase,
	Laptop,
	Sparkles,
	ArrowRight,
	Zap,
} from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@retrouve-ci/ui/components/ui/accordion'

export const metadata: Metadata = {
	title: 'Stickers QR',
	description:
		'Protégez vos objets avec nos stickers QR intelligents. Activation simple, récupération rapide.',
}

const processSteps = [
	{
		number: 1,
		icon: Package,
		title: 'Commandez',
		description:
			'Recevez vos stickers QR avec un code unique pour chaque objet.',
	},
	{
		number: 2,
		icon: QrCode,
		title: 'Activez',
		description:
			'Liez le QR code à votre compte en entrant simplement le code.',
	},
	{
		number: 3,
		icon: Shield,
		title: 'Protégez',
		description: 'Collez le sticker sur vos objets importants.',
	},
	{
		number: 4,
		icon: Heart,
		title: 'Récupérez',
		description: "On vous contacte si quelqu'un retrouve votre objet.",
	},
]

const faqItems = [
	{
		question: 'Mes coordonnées sont-elles publiques ?',
		answer:
			'Non, jamais. Vos coordonnées ne sont jamais affichées publiquement. Tout contact se fait via notre messagerie sécurisée, qui protège votre vie privée.',
		icon: Lock,
	},
	{
		question: "Comment suis-je contacté si quelqu'un trouve mon objet ?",
		answer:
			"Via l'application RetrouveCI ou par SMS/WhatsApp selon vos préférences de notification configurées dans votre compte.",
		icon: MessageCircle,
	},
	{
		question: 'Puis-je désactiver un QR code ?',
		answer:
			'Oui, vous pouvez désactiver un QR code à tout moment depuis votre compte. Le sticker deviendra inactif.',
		icon: Power,
	},
	{
		question: 'Que se passe-t-il si je perds mon téléphone ?',
		answer:
			"Connectez-vous depuis n'importe quel autre appareil. Vos QR codes restent liés à votre compte.",
		icon: Smartphone,
	},
	{
		question: 'Les stickers sont-ils réutilisables ?',
		answer:
			'Oui, vous pouvez réaffecter un sticker à un autre objet depuis les paramètres de votre compte.',
		icon: RefreshCw,
	},
]

const objectExamples = [
	{ icon: Wallet, name: 'Portefeuille' },
	{ icon: Key, name: 'Clés' },
	{ icon: Briefcase, name: 'Sac' },
	{ icon: Laptop, name: 'Électronique' },
]

export default function StickersPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
						<div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
					</div>

					<div className="relative container mx-auto px-4 py-16 md:py-24">
						<div className="mx-auto max-w-4xl">
							<div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
								{/* Text */}
								<div className="flex-1 text-center md:text-left">
									<div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary-green)]/10 px-3 py-1 text-xs font-medium text-[var(--primary-green)]">
										<Sparkles className="h-3.5 w-3.5" />
										Technologie QR intelligente
									</div>
									<h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
										Protégez vos objets avec un simple{' '}
										<span className="text-[var(--primary-green)]">QR code</span>
									</h1>
									<p className="text-muted-foreground mb-8 max-w-lg text-lg">
										Collez, scannez, récupérez. Nos stickers QR permettent à
										quiconque trouve votre objet de vous contacter en toute
										sécurité.
									</p>
									<div className="flex flex-wrap justify-center gap-3 md:justify-start">
										<Button
											asChild
											size="lg"
											className="h-12 bg-[var(--primary-green)] px-6 text-white hover:bg-[var(--primary-green-dark)]"
										>
											<Link href="/stickers/commander">
												Commander mes stickers
												<ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
										<Button
											asChild
											size="lg"
											variant="outline"
											className="h-12 px-6"
										>
											<Link href="/auth">Créer un compte</Link>
										</Button>
									</div>
									<p className="text-muted-foreground mt-4 text-sm">
										À partir de{' '}
										<span className="text-foreground font-semibold">
											1 500 FCFA
										</span>{' '}
										· Livraison gratuite
									</p>
								</div>

								{/* QR Visual */}
								<div className="relative flex-shrink-0">
									<div className="relative h-52 w-52 md:h-64 md:w-64">
										<div className="absolute inset-0 rotate-6 rounded-3xl bg-gradient-to-br from-[var(--primary-green)]/20 to-[var(--accent-orange)]/10" />
										<div className="bg-background absolute inset-0 flex items-center justify-center rounded-2xl border shadow-xl">
											<div className="text-center">
												<QrCode className="mx-auto mb-3 h-20 w-20 text-[var(--primary-green)] md:h-28 md:w-28" />
												<p className="text-muted-foreground text-xs font-medium">
													RCI-XXXX-XXXX
												</p>
											</div>
										</div>
										<div className="absolute -right-3 -bottom-3 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent-orange)] shadow-lg">
											<Zap className="h-7 w-7 text-white" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Bento Grid Features */}
				<section className="py-16 md:py-24">
					<div className="container mx-auto px-4">
						<div className="mb-12 text-center">
							<h2 className="mb-3 text-3xl font-bold md:text-4xl">
								Comment ca marche
							</h2>
							<p className="text-muted-foreground mx-auto max-w-lg">
								De la commande à la récupération, tout est simple et sécurisé.
							</p>
						</div>

						<div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
							{processSteps.map(step => (
								<div
									key={step.number}
									className="group bg-background relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary-green)]/30 hover:shadow-lg"
								>
									<div className="mb-4 flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-colors group-hover:bg-[var(--primary-green)]">
											<step.icon className="h-5 w-5 text-[var(--primary-green)] transition-colors group-hover:text-white" />
										</div>
										<span className="text-muted-foreground/30 text-3xl font-bold">
											{step.number}
										</span>
									</div>
									<h3 className="mb-1 font-semibold">{step.title}</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{step.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* What is a Sticker - Bento Card */}
				<section className="py-8 md:py-12">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-5xl">
							<div className="grid gap-4 md:grid-cols-5">
								{/* Main card */}
								<div className="rounded-2xl border bg-gradient-to-br from-[var(--primary-green)]/5 to-transparent p-8 md:col-span-3">
									<h2 className="mb-3 text-2xl font-bold">
										Qu&apos;est-ce qu&apos;un sticker RetrouveCI ?
									</h2>
									<p className="text-muted-foreground mb-6 leading-relaxed">
										Un QR code unique et résistant que vous collez sur vos
										objets importants. Chaque sticker possède un code unique lié
										à votre compte, permettant une récupération sécurisée.
									</p>
									<div className="flex flex-wrap gap-2">
										{objectExamples.map(item => (
											<div
												key={item.name}
												className="bg-background flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
											>
												<item.icon className="h-4 w-4 text-[var(--primary-green)]" />
												<span>{item.name}</span>
											</div>
										))}
									</div>
								</div>

								{/* Stats cards */}
								<div className="grid grid-cols-2 gap-4 md:col-span-2">
									<div className="bg-background flex flex-col justify-center rounded-2xl border p-5">
										<div className="text-3xl font-bold text-[var(--primary-green)]">
											100%
										</div>
										<p className="text-muted-foreground text-sm">
											Anonymat garanti
										</p>
									</div>
									<div className="bg-background flex flex-col justify-center rounded-2xl border p-5">
										<div className="text-3xl font-bold text-[var(--accent-orange)]">
											2 min
										</div>
										<p className="text-muted-foreground text-sm">
											Pour activer
										</p>
									</div>
									<div className="col-span-2 rounded-2xl bg-[var(--primary-green)] p-5 text-white">
										<CheckCircle className="mb-2 h-6 w-6" />
										<p className="font-medium">
											Stickers réutilisables et transférables
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="bg-muted/30 py-16 md:py-24">
					<div className="container mx-auto px-4">
						<div className="mb-12 text-center">
							<h2 className="mb-3 text-3xl font-bold md:text-4xl">
								Questions fréquentes
							</h2>
							<p className="text-muted-foreground mx-auto max-w-lg">
								Tout ce que vous devez savoir sur la sécurité et
								l&apos;utilisation de nos stickers.
							</p>
						</div>

						<div className="mx-auto max-w-2xl">
							<Accordion type="single" collapsible className="space-y-3">
								{faqItems.map((item, index) => (
									<AccordionItem
										key={index}
										value={`item-${index}`}
										className="bg-background rounded-xl border px-5 transition-shadow data-[state=open]:shadow-md"
									>
										<AccordionTrigger className="py-4 hover:no-underline">
											<div className="flex items-center gap-3 text-left">
												<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary-green)]/10">
													<item.icon className="h-4 w-4 text-[var(--primary-green)]" />
												</div>
												<span className="text-sm font-medium md:text-base">
													{item.question}
												</span>
											</div>
										</AccordionTrigger>
										<AccordionContent className="text-muted-foreground pb-4 pl-11 text-sm">
											{item.answer}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-16 md:py-20">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-3xl text-center">
							<div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-green)]/10">
								<Shield className="h-7 w-7 text-[var(--primary-green)]" />
							</div>
							<h2 className="mb-4 text-3xl font-bold md:text-4xl">
								Prêt à protéger vos objets ?
							</h2>
							<p className="text-muted-foreground mx-auto mb-8 max-w-md">
								Créez un compte gratuitement et commencez à protéger vos objets
								de valeur dès aujourd&apos;hui.
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<Button
									asChild
									size="lg"
									className="h-12 bg-[var(--primary-green)] px-8 text-white hover:bg-[var(--primary-green-dark)]"
								>
									<Link href="/stickers/commander">
										Commander maintenant
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="h-12 px-6"
								>
									<Link href="/auth">Créer un compte</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
