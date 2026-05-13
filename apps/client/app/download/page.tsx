import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DownloadHero } from './components/DownloadHero'
import { BentoFeatures } from './components/BentoFeatures'
import { HowItWorksSteps } from './components/HowItWorksSteps'
import { DownloadCta } from './components/DownloadCta'

export const metadata: Metadata = {
	title: "Télécharger l'app — RetrouveCI",
	description:
		"Téléchargez l'application RetrouveCI pour iOS et Android. Scannez les QR codes et gérez vos objets facilement.",
}

export default function DownloadPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<DownloadHero />
				<BentoFeatures />
				<HowItWorksSteps />
				<DownloadCta />
			</main>
			<Footer />
		</>
	)
}
