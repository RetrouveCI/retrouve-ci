import { data } from 'react-router'
import type { Route } from '../+types/index'
import { ApiError } from '@/shared/utils/api-fetch'
import { getLostItemById } from '../../list/servers/lost-items.service'
import { toLostItemDetail } from '../../mappers/lost-item.mapper'

export async function postDetailLoader({ params }: Route.LoaderArgs) {
	try {
		const dto = await getLostItemById(params.id)

		return { listing: toLostItemDetail(dto) }
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw data(null, { status: 404 })
		}
		throw err
	}
}
