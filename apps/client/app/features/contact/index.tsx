import { ContactHero } from './components/contact-hero'
import { ContactForm } from './components/contact-form'
import { AvailabilityCard } from './components/availability-card'
import { ContactChannels } from './components/contact-channels'
import { ContactFaq } from './components/contact-faq'
import { contactAction } from './servers/contact.action'

export const action = contactAction

export function meta() {
	return [
		{ title: 'Contact — RetrouveCI' },
		{
			name: 'description',
			content:
				"Une question, un signalement ou une suggestion ? Contactez l'équipe RetrouveCI, la plateforme d'objets perdus et retrouvés en Côte d'Ivoire.",
		},
	]
}

export default function Contact() {
	return (
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
	)
}
