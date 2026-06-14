import { data } from 'react-router'
import type { Route } from '../+types/index'
import { listingsService } from '../../servers/lost-items.service'

export async function postDetailLoader({ params }: Route.LoaderArgs) {
	const listing = await listingsService.getById(params.id)
	if (!listing) throw data(null, { status: 404 })
	return { listing }
}
