import { data } from 'react-router'
import type { Route } from '../+types/posts-detail'
import { listingsService } from './listings.service'

export async function postsLoader() {
	const listings = await listingsService.getAll()
	return { listings }
}

export async function postDetailLoader({ params }: Route.LoaderArgs) {
	const listing = await listingsService.getById(params.id)
	if (!listing) throw data(null, { status: 404 })
	return { listing }
}
