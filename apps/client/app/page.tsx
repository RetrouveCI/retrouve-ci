import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/home/hero-section'
import { BentoGridSection } from '@/components/home/bento-grid-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { CtaSection } from '@/components/home/cta-section'

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
