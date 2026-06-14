import { DownloadHero } from '@/features/marketing/components/download/download-hero'
import { BentoFeatures } from '@/features/marketing/components/download/bento-features'
import { HowItWorksSteps } from '@/features/marketing/components/download/how-it-works-steps'
import { DownloadCta } from '@/features/marketing/components/download/download-cta'

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
