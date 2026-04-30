import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
	MapPin,
	Calendar,
	Tag,
	Share2,
	Flag,
	MessageCircle,
	Lock,
	ArrowLeft,
	Package,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@repo/ui/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@repo/ui/lib/utils'

// Mock data - in production this would come from a database
const mockListings = [
	{
		id: '1',
		title: 'iPhone 14 Pro noir',
		description:
			"Téléphone perdu dans un taxi à Cocody vers 18h. L'écran est légèrement fissuré au coin supérieur droit. Il y a une coque transparente avec des autocollants. Le téléphone était presque déchargé au moment de la perte. Récompense offerte pour toute information permettant de le retrouver.",
		location: 'Cocody, Abidjan',
		date: '2 avril 2026',
		type: 'lost' as const,
		category: 'Téléphone',
		image: '/placeholder.svg?height=600&width=800',
		contact: {
			name: 'Kouamé A.',
			method: 'WhatsApp',
		},
	},
	{
		id: '2',
		title: 'Trousseau de clés avec porte-clés rouge',
		description:
			'Clés trouvées près de la pharmacie du marché de Treichville ce matin. Le trousseau contient 4 clés (2 grandes, 2 petites) avec un porte-clés en forme de coeur rouge. Il y a aussi une petite clé USB bleue attachée. Les clés semblent être pour un appartement ou une maison.',
		location: 'Treichville, Abidjan',
		date: '5 avril 2026',
		type: 'found' as const,
		category: 'Clés',
		contact: {
			name: 'Marie K.',
			method: 'Application',
		},
	},
]

interface PageProps {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const listing = mockListings.find(l => l.id === id)

	if (!listing) {
		return { title: 'Annonce non trouvée' }
	}

	return {
		title: listing.title,
		description: listing.description.substring(0, 160),
	}
}

export default async function ListingDetailPage({ params }: PageProps) {
	const { id } = await params
	const listing = mockListings.find(l => l.id === id)

	if (!listing) {
		notFound()
	}

	const isLost = listing.type === 'lost'

	return (
		<>
			<Header />
			<main className="flex-1 py-8 md:py-12">
				<div className="container mx-auto px-4">
					{/* Back Button */}
					<Link
						href="/annonces"
						className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour aux annonces
					</Link>

					<div className="grid gap-8 lg:grid-cols-5">
						{/* Left Column - Image & Details */}
						<div className="space-y-6 lg:col-span-3">
							{/* Image */}
							<div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-2xl">
								{listing.image ? (
									<Image
										src={listing.image}
										alt={listing.title}
										fill
										className="object-cover"
										priority
									/>
								) : (
									<div className="from-muted to-muted/50 absolute inset-0 flex items-center justify-center bg-gradient-to-br">
										<Package className="text-muted-foreground/30 h-24 w-24" />
									</div>
								)}

								{/* Badge */}
								<Badge
									className={cn(
										'absolute top-4 left-4 px-3 py-1 text-sm',
										isLost
											? 'border-0 bg-[var(--accent-orange)] text-white'
											: 'border-0 bg-[var(--primary-green)] text-white',
									)}
								>
									{isLost ? 'Objet perdu' : 'Objet retrouvé'}
								</Badge>
							</div>

							{/* Title & Description */}
							<div>
								<h1 className="mb-4 text-2xl font-bold md:text-3xl">
									{listing.title}
								</h1>

								{/* Meta Info */}
								<div className="mb-6 flex flex-wrap gap-4">
									<div className="text-muted-foreground flex items-center gap-2">
										<MapPin className="h-4 w-4 text-[var(--primary-green)]" />
										<span>{listing.location}</span>
									</div>
									<div className="text-muted-foreground flex items-center gap-2">
										<Calendar className="h-4 w-4 text-[var(--primary-green)]" />
										<span>{listing.date}</span>
									</div>
									<div className="text-muted-foreground flex items-center gap-2">
										<Tag className="h-4 w-4 text-[var(--primary-green)]" />
										<span>{listing.category}</span>
									</div>
								</div>

								{/* Description */}
								<div className="prose prose-gray max-w-none">
									<h2 className="mb-3 text-lg font-semibold">Description</h2>
									<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
										{listing.description}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-4">
								<Button variant="outline" size="sm" className="gap-2">
									<Share2 className="h-4 w-4" />
									Partager
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-muted-foreground hover:text-destructive gap-2"
								>
									<Flag className="h-4 w-4" />
									Signaler
								</Button>
							</div>
						</div>

						{/* Right Column - Contact Card */}
						<div className="lg:col-span-2">
							<div className="lg:sticky lg:top-24">
								<Card className="glass-effect border-white/20 shadow-lg">
									<CardHeader>
										<CardTitle className="text-lg">
											{isLost
												? 'Vous avez trouvé cet objet ?'
												: "C'est votre objet ?"}
										</CardTitle>
										<CardDescription>
											{isLost
												? 'Contactez le propriétaire pour lui rendre.'
												: "Contactez la personne qui l'a trouvé."}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<Button className="h-12 w-full gap-2 bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]">
											<MessageCircle className="h-5 w-5" />
											Envoyer un message
										</Button>

										{/* Privacy Note */}
										<div className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
											<Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--primary-green)]" />
											<p className="text-muted-foreground text-sm">
												Vos coordonnées restent privées. Tout contact se fait
												via notre messagerie sécurisée.
											</p>
										</div>

										{/* Contact Info (anonymized) */}
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

								{/* Extended Privacy Note */}
								<div className="border-border bg-background mt-6 rounded-xl border p-4">
									<h3 className="mb-2 text-sm font-medium">
										Conseils de sécurité
									</h3>
									<ul className="text-muted-foreground space-y-2 text-sm">
										<li>Ne partagez jamais vos informations bancaires</li>
										<li>Privilégiez les rencontres dans des lieux publics</li>
										<li>Signalez tout comportement suspect</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
