import { z } from 'zod'
import {
	lostItemCategorySchema,
	lostItemTypeSchema,
} from '@app/contracts/lost-items'
import { toLostItem } from '@/shared/mappers/lost-item.mapper'
import type { LostItem } from '@/shared/types/lost-item'
import { findMatchingLostItems } from './matching.service'

const querySchema = z.object({
	type: lostItemTypeSchema,
	category: lostItemCategorySchema,
	ville: z.string().min(1),
})

export async function loader({
	request,
}: {
	request: Request
}): Promise<{ items: LostItem[] | null }> {
	const url = new URL(request.url)

	const result = querySchema.safeParse({
		type: url.searchParams.get('type'),
		category: url.searchParams.get('category'),
		ville: url.searchParams.get('ville'),
	})

	if (!result.success) return { items: [] }

	try {
		const items = await findMatchingLostItems(result.data)

		return { items: items.map(toLostItem) }
	} catch {
		// `null` is the failure state, an empty array the empty one: a card that
		// reads an unreachable API as « aucune correspondance » gives the poster
		// the reassuring answer to a question nobody asked.
		return { items: null }
	}
}
