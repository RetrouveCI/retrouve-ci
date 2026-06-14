import { AboutHero } from '@/features/marketing/components/about/about-hero'
import { StatsBar } from '@/features/marketing/components/about/stats-bar'
import { MissionBento } from '@/features/marketing/components/about/mission-bento'
import { ValuesSection } from '@/features/marketing/components/about/values-section'
import { TeamSection } from '@/features/marketing/components/about/team-section'
import { AboutCta } from '@/features/marketing/components/about/about-cta'

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
