import { LostItemNotFoundError } from '../errors/lost-item.errors'
import type { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

export async function requireLostItem(
	repository: LostItemRepository,
	id: string,
): Promise<LostItem> {
	const lostItem = await repository.findById(id)

	if (!lostItem) {
		throw new LostItemNotFoundError(id)
	}

	return lostItem
}
