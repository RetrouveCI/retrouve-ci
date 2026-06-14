import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { MessageCircle, Lock } from 'lucide-react'

interface LostItem {
	type: 'lost' | 'found'
	contact: { name: string; method: string }
}

export function ContactCard({ listing }: { listing: LostItem }) {
	const isLost = listing.type === 'lost'
	return (
		<div className="lg:sticky lg:top-24">
			<Card className="glass-effect border-white/20 shadow-lg">
				<CardHeader>
					<CardTitle className="text-lg">
						{isLost ? 'Vous avez trouvé cet objet ?' : "C'est votre objet ?"}
					</CardTitle>
					<CardDescription>
						{isLost
							? 'Contactez le propriétaire pour lui rendre.'
							: "Contactez la personne qui l'a trouvé."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button className="bg-primary-green hover:bg-primary-green-dark h-12 w-full gap-2 text-white">
						<MessageCircle className="h-5 w-5" />
						Envoyer un message
					</Button>

					<div className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
						<Lock className="text-primary-green mt-0.5 h-5 w-5 shrink-0" />
						<p className="text-muted-foreground text-sm">
							Vos coordonnées restent privées. Tout contact se fait via notre
							messagerie sécurisée.
						</p>
					</div>

					<div className="border-t pt-4">
						<p className="text-muted-foreground text-sm">
							Publié par{' '}
							<span className="text-foreground font-medium">
								{listing.contact.name}
							</span>
						</p>
						<p className="text-muted-foreground text-sm">
							Contact préféré : {listing.contact.method}
						</p>
					</div>
				</CardContent>
			</Card>

			<div className="border-border bg-background mt-6 rounded-xl border p-4">
				<h3 className="mb-2 text-sm font-medium">Conseils de sécurité</h3>
				<ul className="text-muted-foreground space-y-2 text-sm">
					<li>Ne partagez jamais vos informations bancaires</li>
					<li>Privilégiez les rencontres dans des lieux publics</li>
					<li>Signalez tout comportement suspect</li>
				</ul>
			</div>
		</div>
	)
}
