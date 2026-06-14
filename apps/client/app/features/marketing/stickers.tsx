import { StickersHero } from '@/features/marketing/components/stickers/stickers-hero'
import { ProcessStepsSection } from '@/features/marketing/components/stickers/process-steps-section'
import { StickerInfoSection } from '@/features/marketing/components/stickers/sticker-info-section'
import { FaqSection } from '@/features/marketing/components/stickers/faq-section'
import { StickersCta } from '@/features/marketing/components/stickers/stickers-cta'

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
