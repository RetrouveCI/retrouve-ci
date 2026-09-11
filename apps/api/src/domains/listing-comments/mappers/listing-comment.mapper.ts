import {
	ListingCommentSide as PrismaListingCommentSide,
	type ListingComment as PrismaListingComment,
} from '@app/database'
import type {
	ListingComment,
	ListingCommentSide,
	ListingCommentView,
} from '../types/listing-comment.types'

export function toDomainListingComment(
	comment: PrismaListingComment,
): ListingComment {
	return {
		id: comment.id,
		lostItemId: comment.lostItemId,
		authorId: comment.authorId,
		authorSide: toDomainSide(comment.authorSide),
		body: comment.body,
		createdAt: comment.createdAt,
		readAt: comment.readAt,
	}
}

// Names what a thread carries rather than dropping what it must not: the API
// has no response schema, so a column added later would otherwise ship.
export function toListingCommentView(
	comment: ListingComment,
): ListingCommentView {
	return {
		id: comment.id,
		lostItemId: comment.lostItemId,
		authorSide: comment.authorSide,
		body: comment.body,
		createdAt: comment.createdAt,
		readAt: comment.readAt,
	}
}

export function toPrismaSide(
	side: ListingCommentSide,
): PrismaListingCommentSide {
	switch (side) {
		case 'admin':
			return PrismaListingCommentSide.ADMIN
		case 'owner':
			return PrismaListingCommentSide.OWNER
	}
}

export function toDomainSide(
	side: PrismaListingCommentSide,
): ListingCommentSide {
	switch (side) {
		case PrismaListingCommentSide.ADMIN:
			return 'admin'
		case PrismaListingCommentSide.OWNER:
			return 'owner'
	}
}
