import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/app/components/hero-section'
import { BentoGridSection } from '@/app/components/bento-grid-section'
import { HowItWorksSection } from '@/app/components/how-it-works-section'
import { CtaSection } from '@/app/components/cta-section'

export default function HomePage() {
	return (
		<>
			<Header />
			<main className="flex-1 overflow-hidden">
				<HeroSection />
				<BentoGridSection />
				<HowItWorksSection />
				<CtaSection />
			</main>
			<Footer />
		</>
	)
}
