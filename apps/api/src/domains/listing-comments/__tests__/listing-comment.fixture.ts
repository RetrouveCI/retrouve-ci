import { vi } from 'vitest'
import type { ListingCommentRepository } from '../repository/listing-comment.repository'
import type {
	ListingComment,
	ThreadScope,
} from '../types/listing-comment.types'

export const DESK: ThreadScope = { side: 'admin' }
export const POSTER: ThreadScope = { side: 'owner', userId: 'user-1' }

export function buildListingComment(
	overrides: Partial<ListingComment> = {},
): ListingComment {
	return {
		id: 'comment-1',
		lostItemId: 'lost-item-1',
		authorId: 'admin-1',
		authorSide: 'admin',
		body: 'Ajoutez une photo du dos',
		createdAt: new Date('2026-01-01'),
		readAt: null,
		...overrides,
	}
}

/** A concrete class, so the double is a partial cast. */
export function buildRepository(): ListingCommentRepository {
	return {
		create: vi.fn(),
		listThread: vi.fn(),
		markThreadRead: vi.fn(),
		listUnreadThreads: vi.fn(),
	} as unknown as ListingCommentRepository
}
