import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PublishHero } from './components/PublishHero'
import { PublishTypeCards } from './components/PublishTypeCards'
import { TrustBadges } from './components/TrustBadges'

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
				<PublishHero />
				<section className="py-10 md:py-16">
					<div className="container mx-auto px-4">
						<PublishTypeCards />
						<TrustBadges />
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
