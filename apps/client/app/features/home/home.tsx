import { HeroSection } from '@/features/home/components/hero-section'
import { BentoGridSection } from '@/features/home/components/bento-grid-section'
import { HowItWorksSection } from '@/features/home/components/how-it-works-section'
import { CtaSection } from '@/features/home/components/cta-section'

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
