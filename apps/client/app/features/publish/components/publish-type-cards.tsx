import { Link } from 'react-router'
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

export function PublishTypeCards() {
	return (
		<div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
			<Link to="/publish/lost" className="group block">
				<div className="bg-background group-hover:border-accent-orange/40 relative h-full overflow-hidden rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
					<div className="bg-accent-orange h-1.5 w-full" />
					<div className="p-8">
						<div className="bg-accent-orange/10 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
							<AlertCircle className="text-accent-orange h-7 w-7" />
						</div>
						<h2 className="mb-2 text-2xl font-bold">
							J&apos;ai perdu un objet
						</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Signalez votre perte et laissez la communauté vous aider à le
							retrouver.
						</p>
						<ul className="text-muted-foreground mb-8 space-y-2 text-sm">
							<li className="flex items-center gap-2">
								<span className="bg-accent-orange h-1.5 w-1.5 rounded-full" />
								Visible instantanément
							</li>
							<li className="flex items-center gap-2">
								<span className="bg-accent-orange h-1.5 w-1.5 rounded-full" />
								Notifications si quelqu&apos;un retrouve votre objet
							</li>
							<li className="flex items-center gap-2">
								<span className="bg-accent-orange h-1.5 w-1.5 rounded-full" />
								Contact sécurisé via WhatsApp
							</li>
						</ul>
						<div className="text-accent-orange flex items-center gap-2 font-semibold">
							Publier un objet perdu
							<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
						</div>
					</div>
				</div>
			</Link>

			<Link to="/publish/found" className="group block">
				<div className="bg-background group-hover:border-primary-green/40 relative h-full overflow-hidden rounded-2xl border-2 border-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
					<div className="bg-primary-green h-1.5 w-full" />
					<div className="p-8">
						<div className="bg-primary-green/10 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
							<CheckCircle className="text-primary-green h-7 w-7" />
						</div>
						<h2 className="mb-2 text-2xl font-bold">
							J&apos;ai retrouvé un objet
						</h2>
						<p className="text-muted-foreground mb-6 leading-relaxed">
							Aidez le propriétaire à récupérer son bien en publiant votre
							trouvaille.
						</p>
						<ul className="text-muted-foreground mb-8 space-y-2 text-sm">
							<li className="flex items-center gap-2">
								<span className="bg-primary-green h-1.5 w-1.5 rounded-full" />
								Simple et rapide à remplir
							</li>
							<li className="flex items-center gap-2">
								<span className="bg-primary-green h-1.5 w-1.5 rounded-full" />
								Le propriétaire vous contactera directement
							</li>
							<li className="flex items-center gap-2">
								<span className="bg-primary-green h-1.5 w-1.5 rounded-full" />
								Votre numéro reste privé
							</li>
						</ul>
						<div className="text-primary-green flex items-center gap-2 font-semibold">
							Publier un objet retrouvé
							<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
						</div>
					</div>
				</div>
			</Link>
		</div>
	)
}
