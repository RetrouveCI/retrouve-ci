import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { StickersHero } from '@/app/stickers/components/stickers-hero'
import { ProcessStepsSection } from '@/app/stickers/components/process-steps-section'
import { StickerInfoSection } from '@/app/stickers/components/sticker-info-section'
import { FaqSection } from '@/app/stickers/components/faq-section'
import { StickersCta } from '@/app/stickers/components/stickers-cta'

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
