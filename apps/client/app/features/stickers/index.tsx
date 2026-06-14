import { StickersHero } from '@/features/stickers/components/stickers-hero'
import { ProcessStepsSection } from '@/features/stickers/components/process-steps-section'
import { StickerInfoSection } from '@/features/stickers/components/sticker-info-section'
import { FaqSection } from '@/features/stickers/components/faq-section'
import { StickersCta } from '@/features/stickers/components/stickers-cta'

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
