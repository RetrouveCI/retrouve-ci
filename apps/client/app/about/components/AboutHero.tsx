import { Heart } from 'lucide-react'

export function AboutHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="dot-pattern pointer-events-none absolute inset-0 opacity-40" />
			<div className="bg-primary-green/8 absolute -top-24 right-0 h-80 w-80 rounded-full blur-3xl" />
			<div className="relative container mx-auto px-4 py-14 md:py-20">
				<div className="max-w-2xl">
					<div className="border-primary-green/20 bg-primary-green/10 text-primary-green mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
						<Heart className="h-3.5 w-3.5" />
						Notre histoire
					</div>
					<h1 className="mb-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
						Retrouver ce qui compte,{' '}
						<span className="text-primary-green">ensemble</span>
					</h1>
					<p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
						RetrouveCI est née d&apos;une conviction simple : en Côte d&apos;Ivoire, la
						solidarité peut transformer la perte en retrouvaille. Notre plateforme
						connecte les personnes ayant perdu un objet avec celles qui l&apos;ont
						trouvé.
					</p>
				</div>
			</div>
		</section>
	)
}
