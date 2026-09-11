import type { ListingCommentSide } from '@app/contracts/listing-comments'

export type { ListingCommentSide }

export interface ListingComment {
	id: string
	lostItemId: string
	authorId: string | null
	authorSide: ListingCommentSide
	body: string
	createdAt: Date
	readAt: Date | null
}

/** What a thread answers. `toListingCommentView` names its keys; the type only echoes them. */
export type ListingCommentView = Omit<ListingComment, 'authorId'> & {
	authorId?: never
}

export interface CreateListingCommentData {
	lostItemId: string
	authorId: string
	authorSide: ListingCommentSide
	body: string
}

// Whose threads a call touches: the desk every listing's, a poster only the
// listings they own.
export type ThreadScope = { side: 'admin' } | { side: 'owner'; userId: string }

export interface UnreadThread {
	lostItemId: string
	unread: number
}
