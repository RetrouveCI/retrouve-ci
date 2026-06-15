import { z } from 'zod'
import { toLostItem } from '../../lost-items/mappers/lost-item.mapper'
import { OBJECT_TYPES } from '../publish.const'
import { findMatchingLostItems } from './matching.service'

const CATEGORY_VALUES = OBJECT_TYPES.map(o => o.value) as [string, ...string[]]

const querySchema = z.object({
	type: z.enum(['lost', 'found']),
	category: z.enum(CATEGORY_VALUES),
	ville: z.string().min(1),
})

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url)

	const result = querySchema.safeParse({
		type: url.searchParams.get('type'),
		category: url.searchParams.get('category'),
		ville: url.searchParams.get('ville'),
	})

	if (!result.success) return { items: [] }

	const items = await findMatchingLostItems(result.data)

	return { items: items.map(toLostItem) }
}
