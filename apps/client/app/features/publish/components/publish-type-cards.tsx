import { Link } from 'react-router'
import {
	AlertCircle,
	CheckCircle,
	CheckCircle2,
	ArrowRight,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

const TYPE_CARDS = [
	{
		href: '/publish/lost',
		icon: AlertCircle,
		accent: 'orange' as const,
		title: "J'ai perdu un objet",
		description:
			'Signalez votre perte et laissez la communauté vous aider à le retrouver.',
		perks: [
			'Visible instantanément',
			'Notifications si quelqu’un le retrouve',
			'Contact sécurisé via WhatsApp',
		],
		cta: 'Publier un objet perdu',
	},
	{
		href: '/publish/found',
		icon: CheckCircle,
		accent: 'green' as const,
		title: "J'ai retrouvé un objet",
		description:
			'Aidez le propriétaire à récupérer son bien en publiant votre trouvaille.',
		perks: [
			'Simple et rapide à remplir',
			'Le propriétaire vous contacte directement',
			'Votre numéro reste privé',
		],
		cta: 'Publier un objet retrouvé',
	},
]

export function PublishTypeCards() {
	return (
		<div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
			{TYPE_CARDS.map(
				({ href, icon: Icon, accent, title, description, perks, cta }) => {
					const isOrange = accent === 'orange'
					return (
						<Link key={href} to={href} className="group block">
							<div
								className={cn(
									'bg-background relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl',
									isOrange
										? 'group-hover:border-accent-orange/40'
										: 'group-hover:border-primary-green/40',
								)}
							>
								<div
									className={cn(
										'relative p-8 pb-6',
										isOrange
											? 'from-accent-orange/10 bg-linear-to-br to-transparent'
											: 'from-primary-green/10 bg-linear-to-br to-transparent',
									)}
								>
									<div
										className={cn(
											'mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
											isOrange
												? 'from-accent-orange to-accent-orange-dark shadow-accent-orange/20 bg-linear-to-br'
												: 'from-primary-green to-primary-green-dark shadow-primary-green/20 bg-linear-to-br',
										)}
									>
										<Icon className="h-7 w-7" />
									</div>
									<h2 className="mb-2 text-2xl font-bold">{title}</h2>
									<p className="text-muted-foreground leading-relaxed">
										{description}
									</p>
								</div>

								<div className="flex flex-1 flex-col p-8 pt-2">
									<ul className="mb-8 space-y-2.5 text-sm">
										{perks.map(perk => (
											<li key={perk} className="flex items-center gap-2.5">
												<CheckCircle2
													className={cn(
														'h-4 w-4 shrink-0',
														isOrange
															? 'text-accent-orange'
															: 'text-primary-green',
													)}
												/>
												<span className="text-muted-foreground">{perk}</span>
											</li>
										))}
									</ul>

									<div
										className={cn(
											'mt-auto flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition-all',
											isOrange
												? 'bg-accent-orange group-hover:bg-accent-orange-dark'
												: 'bg-primary-green group-hover:bg-primary-green-dark',
										)}
									>
										{cta}
										<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
									</div>
								</div>
							</div>
						</Link>
					)
				},
			)}
		</div>
	)
}
