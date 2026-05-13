import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PostContent } from './components/PostContent'
import { ContactCard } from './components/ContactCard'

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
		contact: { name: 'Kouamé A.', method: 'WhatsApp' },
	},
	{
		id: '2',
		title: 'Trousseau de clés avec porte-clés rouge',
		description:
			'Clés trouvées près de la pharmacie du marché de Treichville ce matin. Le trousseau contient 4 clés (2 grandes, 2 petites) avec un porte-clés en forme de cœur rouge. Il y a aussi une petite clé USB bleue attachée. Les clés semblent être pour un appartement ou une maison.',
		location: 'Treichville, Abidjan',
		date: '5 avril 2026',
		type: 'found' as const,
		category: 'Clés',
		contact: { name: 'Marie K.', method: 'Application' },
	},
]

interface PageProps {
	params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params
	const listing = mockListings.find(l => l.id === id)
	if (!listing) return { title: 'Annonce non trouvée' }
	return {
		title: listing.title,
		description: listing.description.substring(0, 160),
	}
}

export default async function ListingDetailPage({ params }: PageProps) {
	const { id } = await params
	const listing = mockListings.find(l => l.id === id)

	if (!listing) notFound()

	return (
		<>
			<Header />
			<main className="flex-1 py-8 md:py-12">
				<div className="container mx-auto px-4">
					<Link
						href="/posts"
						className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour aux annonces
					</Link>

					<div className="grid gap-8 lg:grid-cols-5">
						<PostContent listing={listing} />
						<div className="lg:col-span-2">
							<ContactCard listing={listing} />
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
