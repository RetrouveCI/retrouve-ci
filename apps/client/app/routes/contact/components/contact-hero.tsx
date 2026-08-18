import { MessageSquare } from 'lucide-react'

export function ContactHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
			<div className="bg-accent-orange/6 absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />
			<div className="relative container mx-auto max-w-2xl px-4 py-14 text-center md:py-20">
				<div className="border-accent-orange/20 bg-accent-orange/10 text-accent-orange mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
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
	)
}
