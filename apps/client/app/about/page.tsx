import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AboutHero } from './components/AboutHero'
import { StatsBar } from './components/StatsBar'
import { MissionBento } from './components/MissionBento'
import { ValuesSection } from './components/ValuesSection'
import { TeamSection } from './components/TeamSection'
import { AboutCta } from './components/AboutCta'

export const metadata: Metadata = {
	title: 'À propos — RetrouveCI',
	description:
		"Découvrez la mission, les valeurs et l'équipe derrière RetrouveCI, la plateforme des objets perdus et retrouvés en Côte d'Ivoire.",
}

export default function AboutPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<AboutHero />
				<StatsBar />
				<MissionBento />
				<ValuesSection />
				<TeamSection />
				<AboutCta />
			</main>
			<Footer />
		</>
	)
}
