import { Sparkles } from 'lucide-react'

export function PublishHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary-green/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				<div className="bg-accent-orange/5 absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4 pt-12 pb-10 text-center">
				<div className="border-primary-green/20 bg-primary-green/10 text-primary-green mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
					<Sparkles className="h-3.5 w-3.5" />
					Publier est 100 % gratuit
				</div>
				<h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
					Que souhaitez-vous
					<br className="hidden sm:block" /> signaler ?
				</h1>
				<p className="text-muted-foreground mx-auto max-w-md text-base md:text-lg">
					Choisissez le type d&apos;annonce à publier — cela ne prend que
					quelques instants.
				</p>
			</div>
		</section>
	)
}
