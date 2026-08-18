import { AboutHero } from './components/about-hero'
import { StatsBar } from './components/stats-bar'
import { MissionBento } from './components/mission-bento'
import { ValuesSection } from './components/values-section'
import { TeamSection } from './components/team-section'
import { AboutCta } from './components/about-cta'
import { pageMeta } from '@/shared/lib/page-meta'

export function meta() {
	return pageMeta({
		title: 'À propos',
		description:
			"Découvrez la mission, les valeurs et l'équipe derrière RetrouveCI, la plateforme des objets perdus et retrouvés en Côte d'Ivoire.",
	})
}

export default function AboutPage() {
	return (
		<main className="flex-1">
			<AboutHero />
			<StatsBar />
			<MissionBento />
			<ValuesSection />
			<TeamSection />
			<AboutCta />
		</main>
	)
}
