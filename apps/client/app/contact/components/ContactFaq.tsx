'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

const faqs = [
	{
		q: 'Comment publier une annonce ?',
		a: "Rendez-vous sur la page « Publier », choisissez le type d'annonce (perdu ou retrouvé), remplissez le formulaire et validez. Votre annonce est visible instantanément.",
	},
	{
		q: 'Mes données personnelles sont-elles protégées ?',
		a: "Oui. Votre numéro de téléphone n'est jamais affiché publiquement. Tout contact se fait via notre messagerie sécurisée.",
	},
	{
		q: 'Comment fonctionnent les stickers QR ?',
		a: "Chaque sticker contient un QR code unique lié à votre profil. Quand quelqu'un scanne le sticker sur votre objet, il peut vous contacter directement sans voir vos informations personnelles.",
	},
	{
		q: 'Comment supprimer mon annonce ?',
		a: "Connectez-vous à votre compte, accédez à la section « Mes annonces » et cliquez sur « Supprimer ». L'annonce disparaît immédiatement.",
	},
	{
		q: "RetrouveCI est-il disponible en dehors d'Abidjan ?",
		a: "Oui ! La plateforme couvre 26 villes ivoiriennes dont Bouaké, Yamoussoukro, Daloa, San-Pédro et bien d'autres.",
	},
]

export function ContactFaq() {
	const [openFaq, setOpenFaq] = useState<number | null>(null)

	return (
		<section className="border-t py-12 md:py-16">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-2xl">
					<h2 className="mb-2 text-center text-3xl font-bold">Questions fréquentes</h2>
					<p className="text-muted-foreground mb-8 text-center">
						Les réponses aux questions les plus posées.
					</p>
					<div className="space-y-3">
						{faqs.map((faq, i) => (
							<div key={i} className="bg-background overflow-hidden rounded-2xl border">
								<button
									className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
									onClick={() => setOpenFaq(openFaq === i ? null : i)}
								>
									<span className="text-sm font-medium">{faq.q}</span>
									<ChevronDown
										className={cn(
											'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
											openFaq === i && 'rotate-180',
										)}
									/>
								</button>
								{openFaq === i && (
									<div className="text-muted-foreground border-t px-6 pt-4 pb-5 text-sm leading-relaxed">
										{faq.a}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
