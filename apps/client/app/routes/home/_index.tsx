import { HeroSection } from './components/hero-section'
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
//
// So is the sticker banner: a slab above the hero read as an interstitial on a
// wide screen. The arrival is a notification now and the standing task a badge
// (kept intact, see components/sticker-activation-banner.tsx)
// import { StickerActivationBanner } from './components/sticker-activation-banner'

export const loader = homeLoader

export default function Home({ loaderData }: Route.ComponentProps) {
	const { recent } = loaderData

	return (
		<main>
			<HeroSection publishedCount={recent?.total} />
			<RecentListingsStrip recent={recent} />
			<StickersSection />
			{/* <BentoGridSection /> */}
			<HowItWorksSection />
			{/* <CtaSection /> */}
		</main>
	)
}
