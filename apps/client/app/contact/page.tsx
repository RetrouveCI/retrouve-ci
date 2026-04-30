'use client'

import { useState } from 'react'
import {
	Mail,
	MessageSquare,
	Phone,
	MapPin,
	Send,
	Clock,
	CheckCircle2,
	ChevronDown,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@repo/ui/lib/utils'

const faqs = [
	{
		q: 'Comment publier une annonce ?',
		a: "Rendez-vous sur la page « Publier », choisissez le type d'annonce (perdu ou retrouvé), remplissez le formulaire et validez. Votre annonce est visible instantanément.",
	},
	{
		q: 'Mes données personnelles sont-elles protégées ?',
		a: "Oui. Votre numéro de téléphone n'est jamais affiché publiquement. Tout contact se fait via notre messagerie sécurisée.",
	},
	{
		q: 'Comment fonctionnent les stickers QR ?',
		a: "Chaque sticker contient un QR code unique lié à votre profil. Quand quelqu'un scanne le sticker sur votre objet, il peut vous contacter directement sans voir vos informations personnelles.",
	},
	{
		q: 'Comment supprimer mon annonce ?',
		a: "Connectez-vous à votre compte, accédez à la section « Mes annonces » et cliquez sur « Supprimer ». L'annonce disparaît immédiatement.",
	},
	{
		q: "RetrouveCI est-il disponible en dehors d'Abidjan ?",
		a: "Oui ! La plateforme couvre 26 villes ivoiriennes dont Bouaké, Yamoussoukro, Daloa, San-Pédro et bien d'autres.",
	},
]

const channels = [
	{
		icon: Mail,
		title: 'Email',
		value: 'contact@retrouveci.ci',
		detail: 'Réponse sous 24h ouvrées',
		color: 'text-[var(--primary-green)]',
		bg: 'bg-[var(--primary-green)]/10',
		href: 'mailto:contact@retrouveci.ci',
	},
	{
		icon: MessageSquare,
		title: 'WhatsApp',
		value: '+225 07 00 00 00 00',
		detail: 'Lun–Ven, 8h–18h',
		color: 'text-[var(--accent-orange)]',
		bg: 'bg-[var(--accent-orange)]/10',
		href: 'https://wa.me/2250700000000',
	},
	{
		icon: MapPin,
		title: 'Adresse',
		value: 'Cocody, Abidjan',
		detail: "Côte d'Ivoire",
		color: 'text-blue-500',
		bg: 'bg-blue-500/10',
		href: null,
	},
]

export default function ContactPage() {
	const [form, setForm] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	})
	const [submitted, setSubmitted] = useState(false)
	const [openFaq, setOpenFaq] = useState<number | null>(null)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitted(true)
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
					<div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--accent-orange)]/6 blur-3xl" />
					<div className="relative container mx-auto max-w-2xl px-4 py-14 text-center md:py-20">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent-orange)]/20 bg-[var(--accent-orange)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent-orange)]">
							<MessageSquare className="h-3.5 w-3.5" />
							Nous sommes à votre écoute
						</div>
						<h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
							Contactez-nous
						</h1>
						<p className="text-muted-foreground text-lg leading-relaxed">
							Une question, un signalement ou une suggestion ? Notre équipe vous
							répond rapidement.
						</p>
					</div>
				</section>

				{/* Bento grid */}
				<section className="py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="grid gap-4 md:grid-cols-12">
							{/* Contact form — large */}
							<div className="bg-background rounded-2xl border p-8 md:col-span-7">
								<h2 className="mb-6 text-xl font-bold">Envoyer un message</h2>

								{submitted ? (
									<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
										<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-green)]/10">
											<CheckCircle2 className="h-8 w-8 text-[var(--primary-green)]" />
										</div>
										<div>
											<p className="mb-1 text-lg font-semibold">
												Message envoyé !
											</p>
											<p className="text-muted-foreground text-sm">
												Nous vous répondrons dans les 24 heures.
											</p>
										</div>
										<button
											onClick={() => {
												setSubmitted(false)
												setForm({
													name: '',
													email: '',
													subject: '',
													message: '',
												})
											}}
											className="text-sm text-[var(--primary-green)] hover:underline"
										>
											Envoyer un autre message
										</button>
									</div>
								) : (
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<label className="text-sm font-medium">
													Nom complet
												</label>
												<input
													type="text"
													required
													placeholder="Konan Yao"
													value={form.name}
													onChange={e =>
														setForm(p => ({ ...p, name: e.target.value }))
													}
													className="bg-muted/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:border-[var(--primary-green)]/50 focus:ring-2 focus:ring-[var(--primary-green)]/30"
												/>
											</div>
											<div className="space-y-1.5">
												<label className="text-sm font-medium">Email</label>
												<input
													type="email"
													required
													placeholder="vous@exemple.ci"
													value={form.email}
													onChange={e =>
														setForm(p => ({ ...p, email: e.target.value }))
													}
													className="bg-muted/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:border-[var(--primary-green)]/50 focus:ring-2 focus:ring-[var(--primary-green)]/30"
												/>
											</div>
										</div>
										<div className="space-y-1.5">
											<label className="text-sm font-medium">Sujet</label>
											<input
												type="text"
												required
												placeholder="Comment pouvons-nous vous aider ?"
												value={form.subject}
												onChange={e =>
													setForm(p => ({ ...p, subject: e.target.value }))
												}
												className="bg-muted/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:border-[var(--primary-green)]/50 focus:ring-2 focus:ring-[var(--primary-green)]/30"
											/>
										</div>
										<div className="space-y-1.5">
											<label className="text-sm font-medium">Message</label>
											<textarea
												required
												rows={5}
												placeholder="Décrivez votre demande..."
												value={form.message}
												onChange={e =>
													setForm(p => ({ ...p, message: e.target.value }))
												}
												className="bg-muted/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:border-[var(--primary-green)]/50 focus:ring-2 focus:ring-[var(--primary-green)]/30"
											/>
										</div>
										<button
											type="submit"
											className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-green)] text-sm font-medium text-white transition-colors hover:bg-[var(--primary-green-dark)]"
										>
											<Send className="h-4 w-4" />
											Envoyer le message
										</button>
									</form>
								)}
							</div>

							{/* Right column */}
							<div className="flex flex-col gap-4 md:col-span-5">
								{/* Availability card */}
								<div className="rounded-2xl border bg-[var(--primary-green)] p-6 text-white">
									<div className="mb-3 flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
											<Clock className="h-4 w-4" />
										</div>
										<h3 className="font-semibold">Disponibilité</h3>
									</div>
									<div className="space-y-1.5 text-sm text-white/90">
										<div className="flex justify-between">
											<span>Lundi – Vendredi</span>
											<span className="font-medium">8h – 18h</span>
										</div>
										<div className="flex justify-between">
											<span>Samedi</span>
											<span className="font-medium">9h – 13h</span>
										</div>
										<div className="flex justify-between">
											<span>Dimanche</span>
											<span className="font-medium text-white/60">Fermé</span>
										</div>
									</div>
									<div className="mt-4 flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-white/70">
										<span className="animate-pulse-soft h-2 w-2 rounded-full bg-emerald-300" />
										Temps de réponse moyen : 2h
									</div>
								</div>

								{/* Channels */}
								{channels.map(ch => {
									const Icon = ch.icon
									const content = (
										<div className="bg-background group flex items-center gap-4 rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5">
											<div
												className={`h-11 w-11 rounded-xl ${ch.bg} flex shrink-0 items-center justify-center`}
											>
												<Icon className={`h-5 w-5 ${ch.color}`} />
											</div>
											<div className="min-w-0">
												<p className="text-muted-foreground text-xs">
													{ch.title}
												</p>
												<p className="truncate text-sm font-semibold">
													{ch.value}
												</p>
												<p className="text-muted-foreground text-xs">
													{ch.detail}
												</p>
											</div>
										</div>
									)
									return ch.href ? (
										<a
											key={ch.title}
											href={ch.href}
											target="_blank"
											rel="noopener noreferrer"
										>
											{content}
										</a>
									) : (
										<div key={ch.title}>{content}</div>
									)
								})}
							</div>
						</div>
					</div>
				</section>

				{/* FAQ */}
				<section className="border-t py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-2xl">
							<h2 className="mb-2 text-center text-3xl font-bold">
								Questions fréquentes
							</h2>
							<p className="text-muted-foreground mb-8 text-center">
								Les réponses aux questions les plus posées.
							</p>
							<div className="space-y-3">
								{faqs.map((faq, i) => (
									<div
										key={i}
										className="bg-background overflow-hidden rounded-2xl border"
									>
										<button
											className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
											onClick={() => setOpenFaq(openFaq === i ? null : i)}
										>
											<span className="text-sm font-medium">{faq.q}</span>
											<ChevronDown
												className={cn(
													'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
													openFaq === i && 'rotate-180',
												)}
											/>
										</button>
										{openFaq === i && (
											<div className="text-muted-foreground border-t px-6 pt-4 pb-5 text-sm leading-relaxed">
												{faq.a}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
