import { LostItemForbiddenError } from '../errors/lost-item.errors'
import type { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'
import { requireLostItem } from './require-lost-item'

export async function requireOwnedLostItem(
	repository: LostItemRepository,
	id: string,
	userId: string,
): Promise<LostItem> {
	const lostItem = await requireLostItem(repository, id)

	if (lostItem.userId !== userId) {
		throw new LostItemForbiddenError(id)
	}

	return lostItem
}
