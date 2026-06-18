import { PublishHero } from './components/publish-hero'
import { PublishTypeCards } from './components/publish-type-cards'
import { PublishSteps } from './components/publish-steps'
import { TrustBadges } from './components/trust-badges'

export function meta() {
	return [
		{ title: 'Publier une annonce' },
		{
			name: 'description',
			content:
				"Publiez une annonce pour un objet perdu ou retrouvé en Côte d'Ivoire.",
		},
	]
}

export default function PublierPage() {
	return (
		<main className="flex-1">
			<PublishHero />
			<section className="py-10 md:py-16">
				<div className="container mx-auto px-4">
					<PublishTypeCards />
					<PublishSteps />
					<TrustBadges />
				</div>
			</section>
		</main>
	)
}
