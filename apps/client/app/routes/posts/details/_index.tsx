import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PostContent } from './components/post-content'
import { PostGallery } from './components/post-gallery'
import { ContactBar } from './components/contact-bar'
import { postDetailLoader } from './servers/lost-items.loader'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'
import { rememberViewedListing } from '@/shared/helpers/viewed-listings'

export const loader = postDetailLoader

export function meta({ data }: Route.MetaArgs) {
	if (!data) return pageMeta({ title: 'Annonce non trouvée' })

	return pageMeta({
		title: data.listing.title,
		description: data.listing.description.substring(0, 160),
		type: 'article',
	})
}

export default function ListingDetailPage({
	loaderData,
}: Route.ComponentProps) {
	const { listing } = loaderData
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	// What the offline page lists: the worker caches this document as it is
	// served, and the index is what gives the entry a title to show.
	useEffect(() => {
		rememberViewedListing({
			id: listing.id,
			title: listing.title,
			location: listing.location,
		})
	}, [listing.id, listing.title, listing.location])

	useEffect(() => {
		if (searchParams.get('published') !== '1') return

		toast.success('Annonce publiée !', {
			description: 'Votre annonce est maintenant visible par tous.',
		})

		const next = new URLSearchParams(searchParams)
		next.delete('published')
		navigate({ search: next.toString() }, { replace: true })
	}, [searchParams, navigate])

	/**
	 * One column at every width. The right rail the desktop used to carry held the
	 * contact card, the publisher and the safety notice; R10 moves the last two
	 * into the flow and the first into the bar, which leaves the rail with nothing
	 * to hold. No artboard draws this screen above 390 px.
	 */
	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col sm:px-6 sm:py-6">
			<div className="relative">
				<PostGallery images={listing.images ?? []} title={listing.title} />

				<Link
					to="/posts"
					aria-label="Retour aux annonces"
					title="Retour aux annonces"
					className="absolute top-3.5 left-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
			</div>

			<div className="px-4 py-5 sm:px-0">
				<PostContent listing={listing} />
			</div>

			<ContactBar listing={listing} />
		</main>
	)
}
