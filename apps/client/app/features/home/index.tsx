import { HeroSection } from './components/hero-section'
import { BentoGridSection } from './components/bento-grid-section'
import { HowItWorksSection } from './components/how-it-works-section'
import { CtaSection } from './components/cta-section'

export default function Home() {
	return (
		<main>
			<HeroSection />
			<BentoGridSection />
			<HowItWorksSection />
			<CtaSection />
		</main>
	)
}
