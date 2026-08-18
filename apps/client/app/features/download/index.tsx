import { DownloadHero } from './components/download-hero'
import { BentoFeatures } from './components/bento-features'
import { HowItWorksSteps } from './components/how-it-works-steps'
import { DownloadCta } from './components/download-cta'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: "Télécharger l'app",
		description:
			"Téléchargez l'application RetrouveCI pour iOS et Android. Scannez les QR codes et gérez vos objets facilement.",
	})
}

export default function Download() {
	return (
		<main className="flex-1">
			<DownloadHero />
			<BentoFeatures />
			<HowItWorksSteps />
			<DownloadCta />
		</main>
	)
}
