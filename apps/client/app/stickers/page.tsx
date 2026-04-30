import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { StickersHero } from '@/components/stickers/stickers-hero'
import { ProcessStepsSection } from '@/components/stickers/process-steps-section'
import { StickerInfoSection } from '@/components/stickers/sticker-info-section'
import { FaqSection } from '@/components/stickers/faq-section'
import { StickersCta } from '@/components/stickers/stickers-cta'

export const metadata: Metadata = {
	title: 'Stickers QR',
	description:
		'Protégez vos objets avec nos stickers QR intelligents. Activation simple, récupération rapide.',
}

export default function StickersPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<StickersHero />
				<ProcessStepsSection />
				<StickerInfoSection />
				<FaqSection />
				<StickersCta />
			</main>
			<Footer />
		</>
	)
}
