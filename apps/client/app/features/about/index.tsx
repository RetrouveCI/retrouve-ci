import { AboutHero } from '@/features/about/components/about-hero'
import { StatsBar } from '@/features/about/components/stats-bar'
import { MissionBento } from '@/features/about/components/mission-bento'
import { ValuesSection } from '@/features/about/components/values-section'
import { TeamSection } from '@/features/about/components/team-section'
import { AboutCta } from '@/features/about/components/about-cta'

export function meta() {
	return [
		{ title: 'À propos — RetrouveCI' },
		{
			name: 'description',
			content:
				"Découvrez la mission, les valeurs et l'équipe derrière RetrouveCI, la plateforme des objets perdus et retrouvés en Côte d'Ivoire.",
		},
	]
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
