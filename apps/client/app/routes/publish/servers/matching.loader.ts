import { z } from 'zod'
import {
	lostItemCategorySchema,
	lostItemTypeSchema,
} from '@app/contracts/lost-items'
import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import { findMatchingLostItems } from './matching.service'

const querySchema = z.object({
	type: lostItemTypeSchema,
	category: lostItemCategorySchema,
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
