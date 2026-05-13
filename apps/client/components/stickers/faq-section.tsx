import { Lock, MessageCircle, Power, Smartphone, RefreshCw } from 'lucide-react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@retrouve-ci/ui/components/ui/accordion'

const FAQ_ITEMS = [
	{
		question: 'Mes coordonnées sont-elles publiques ?',
		answer:
			'Non, jamais. Vos coordonnées ne sont jamais affichées publiquement. Tout contact se fait via notre messagerie sécurisée, qui protège votre vie privée.',
		icon: Lock,
	},
	{
		question: "Comment suis-je contacté si quelqu'un trouve mon objet ?",
		answer:
			"Via l'application RetrouveCI ou par SMS/WhatsApp selon vos préférences de notification configurées dans votre compte.",
		icon: MessageCircle,
	},
	{
		question: 'Puis-je désactiver un QR code ?',
		answer:
			'Oui, vous pouvez désactiver un QR code à tout moment depuis votre compte. Le sticker deviendra inactif.',
		icon: Power,
	},
	{
		question: 'Que se passe-t-il si je perds mon téléphone ?',
		answer:
			"Connectez-vous depuis n'importe quel autre appareil. Vos QR codes restent liés à votre compte.",
		icon: Smartphone,
	},
	{
		question: 'Les stickers sont-ils réutilisables ?',
		answer:
			'Oui, vous pouvez réaffecter un sticker à un autre objet depuis les paramètres de votre compte.',
		icon: RefreshCw,
	},
]

export function FaqSection() {
	return (
		<section className="bg-muted/30 py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="mb-12 text-center">
					<h2 className="mb-3 text-3xl font-bold md:text-4xl">
						Questions fréquentes
					</h2>
					<p className="text-muted-foreground mx-auto max-w-lg">
						Tout ce que vous devez savoir sur la sécurité et l&apos;utilisation
						de nos stickers.
					</p>
				</div>

				<div className="mx-auto max-w-2xl">
					<Accordion type="single" collapsible className="space-y-3">
						{FAQ_ITEMS.map((item, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="bg-background rounded-xl border px-5 transition-shadow data-[state=open]:shadow-md"
							>
								<AccordionTrigger className="py-4 hover:no-underline">
									<div className="flex items-center gap-3 text-left">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-(--primary-green)/10">
											<item.icon className="h-4 w-4 text-(--primary-green)" />
										</div>
										<span className="text-sm font-medium md:text-base">
											{item.question}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground pb-4 pl-11 text-sm">
									{item.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	)
}
