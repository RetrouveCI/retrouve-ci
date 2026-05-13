import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ContactHero } from './components/ContactHero'
import { ContactForm } from './components/ContactForm'
import { AvailabilityCard } from './components/AvailabilityCard'
import { ContactChannels } from './components/ContactChannels'
import { ContactFaq } from './components/ContactFaq'

export default function ContactPage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<ContactHero />
				<section className="py-12 md:py-16">
					<div className="container mx-auto px-4">
						<div className="grid gap-4 md:grid-cols-12">
							<div className="bg-background rounded-2xl border p-8 md:col-span-7">
								<h2 className="mb-6 text-xl font-bold">Envoyer un message</h2>
								<ContactForm />
							</div>
							<div className="flex flex-col gap-4 md:col-span-5">
								<AvailabilityCard />
								<ContactChannels />
							</div>
						</div>
					</div>
				</section>
				<ContactFaq />
			</main>
			<Footer />
		</>
	)
}
