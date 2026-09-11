import type { ListingCommentSide } from '@app/contracts/listing-comments'

/** One message of a listing's thread with the team. */
export interface ListingComment {
	id: string
	lostItemId: string
	authorSide: ListingCommentSide
	body: string
	createdAt: string
	readAt: string | null
}

export interface UnreadThread {
	lostItemId: string
	unread: number
}

/** Unread messages from the team, per listing id. */
export type UnreadReplies = Record<string, number>
