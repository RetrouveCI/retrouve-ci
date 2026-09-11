import { requireAdminSession } from '@/shared/helpers/session.server'
import { readSearch } from '@/shared/helpers/list-params'
import { PALETTE_MIN_QUERY } from '../palette.const'
import { searchPalette } from './palette.service'

/**
 * A resource route, read by `usePaletteSearch`. It names the query it
 * searched, so a slow answer cannot land on top of a newer query.
 */
export async function loader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const query = readSearch(new URL(request.url).searchParams) ?? ''

	if (query.length < PALETTE_MIN_QUERY) return { query, hits: [] }

	return { query, hits: await searchPalette(query, request) }
}
