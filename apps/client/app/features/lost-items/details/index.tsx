import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PostContent } from '@/features/lost-items/details/components/post-content'
import { ContactCard } from '@/features/lost-items/details/components/contact-card'
import { postDetailLoader } from '@/features/lost-items/details/servers/lost-items.loader'
import type { Route } from './+types/index'

export const loader = postDetailLoader

export function meta({ data }: Route.MetaArgs) {
	if (!data) return [{ title: 'Annonce non trouvée' }]
	return [
		{ title: data.listing.title },
		{
			name: 'description',
			content: data.listing.description.substring(0, 160),
		},
	]
}

export default function ListingDetailPage({ loaderData }: Route.ComponentProps) {
	const { listing } = loaderData

	return (
		<main className="flex-1 py-8 md:py-12">
			<div className="container mx-auto px-4">
				<Link
					to="/posts"
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
	)
}
