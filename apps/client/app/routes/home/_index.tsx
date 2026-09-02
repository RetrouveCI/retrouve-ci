import { HeroSection } from './components/hero-section'
import { StickerActivationBanner } from './components/sticker-activation-banner'
import { RecentListingsStrip } from './components/recent-listings-strip'
import { StickersSection } from './components/stickers-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { homeLoader } from './servers/home.loader'
import type { Route } from './+types/_index'
// Bento grid and closing CTA on stand-by: the four home artboards draw neither,
// and both pushed the product block five screens down (kept intact, see
// components/bento-grid-section.tsx and components/cta-section.tsx)
// import { BentoGridSection } from './components/bento-grid-section'
// import { CtaSection } from './components/cta-section'

export const loader = homeLoader

export default function Home({ loaderData }: Route.ComponentProps) {
	const { recent, stickers } = loaderData

	return (
		<main>
			{stickers && stickers.pending > 0 && (
				<StickerActivationBanner pending={stickers.pending} />
			)}
			<HeroSection publishedCount={recent?.total} />
			<RecentListingsStrip recent={recent} />
			<StickersSection />
			{/* <BentoGridSection /> */}
			<HowItWorksSection />
			{/* <CtaSection /> */}
		</main>
	)
}
