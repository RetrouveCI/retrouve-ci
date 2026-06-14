import { StickersHero } from './components/stickers-hero'
import { ProcessStepsSection } from './components/process-steps-section'
import { StickerInfoSection } from './components/sticker-info-section'
import { FaqSection } from './components/faq-section'
import { StickersCta } from './components/stickers-cta'

export function meta() {
	return [
		{ title: 'Stickers QR' },
		{
			name: 'description',
			content:
				'Protégez vos objets avec nos stickers QR intelligents. Activation simple, récupération rapide.',
		},
	]
}

export default function Stickers() {
	return (
		<main className="flex-1">
			<StickersHero />
			<ProcessStepsSection />
			<StickerInfoSection />
			<FaqSection />
			<StickersCta />
		</main>
	)
}
