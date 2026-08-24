import { LostItemNotFoundError } from '../errors/lost-item.errors'
import type { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'
import { requireLostItem } from './require-lost-item'

/**
 * Anything a visitor reaches by id must be published. An unpublished listing
 * answers **not found** rather than forbidden: confirming that an id exists
 * while it is still under moderation leaks more than it helps.
 */
export async function requirePublishedLostItem(
	repository: LostItemRepository,
	id: string,
): Promise<LostItem> {
	const lostItem = await requireLostItem(repository, id)

	if (lostItem.moderationStatus !== 'published') {
		throw new LostItemNotFoundError(id)
	}

	return lostItem
}
