import { DownloadHero } from '@/features/download/components/download-hero'
import { BentoFeatures } from '@/features/download/components/bento-features'
import { HowItWorksSteps } from '@/features/download/components/how-it-works-steps'
import { DownloadCta } from '@/features/download/components/download-cta'

export function meta() {
	return [
		{ title: "Télécharger l'app — RetrouveCI" },
		{
			name: 'description',
			content:
				"Téléchargez l'application RetrouveCI pour iOS et Android. Scannez les QR codes et gérez vos objets facilement.",
		},
	]
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
