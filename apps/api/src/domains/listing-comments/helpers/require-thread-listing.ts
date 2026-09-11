import { requireLostItem } from '@/domains/lost-items/helpers/require-lost-item'
import { requireOwnedLostItem } from '@/domains/lost-items/helpers/require-owned-lost-item'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { LostItem } from '@/domains/lost-items/types/lost-item.types'
import type { ThreadScope } from '../types/listing-comment.types'

// Refuses a poster's call on someone else's listing outright, rather than
// answering an empty thread that would read as « no comment yet ».
export function requireThreadListing(
	repository: LostItemRepository,
	lostItemId: string,
	scope: ThreadScope,
): Promise<LostItem> {
	return scope.side === 'admin'
		? requireLostItem(repository, lostItemId)
		: requireOwnedLostItem(repository, lostItemId, scope.userId)
}
