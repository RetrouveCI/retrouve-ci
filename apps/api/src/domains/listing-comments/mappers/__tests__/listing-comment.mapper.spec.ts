import { ListingCommentSide as PrismaListingCommentSide } from '@app/database'
import { LISTING_COMMENT_SIDES } from '@app/contracts/listing-comments'
import { describe, expect, it } from 'vitest'
import { buildListingComment } from '../../__tests__/listing-comment.fixture'
import {
	toDomainListingComment,
	toDomainSide,
	toListingCommentView,
	toPrismaSide,
} from '../listing-comment.mapper'

describe('listing comment mapper', () => {
	it('maps a Prisma row to the domain model', () => {
		expect(
			toDomainListingComment({
				id: 'comment-1',
				lostItemId: 'lost-item-1',
				authorId: null,
				authorSide: PrismaListingCommentSide.OWNER,
				body: 'Voici une photo du dos',
				createdAt: new Date('2026-01-01'),
				readAt: null,
			}),
		).toEqual({
			id: 'comment-1',
			lostItemId: 'lost-item-1',
			authorId: null,
			authorSide: 'owner',
			body: 'Voici une photo du dos',
			createdAt: new Date('2026-01-01'),
			readAt: null,
		})
	})
})

// The emitted keys, not a probe for one field: a column added to the model
// must be named here before a thread carries it.
describe('what a thread answers', () => {
	it('carries exactly these keys', () => {
		expect(
			Object.keys(toListingCommentView(buildListingComment())).sort(),
		).toEqual(['authorSide', 'body', 'createdAt', 'id', 'lostItemId', 'readAt'])
	})

	it('keeps the author’s account id inside the API', () => {
		expect(
			toListingCommentView(buildListingComment({ authorId: 'admin-1' })),
		).not.toHaveProperty('authorId')
	})
})

// Only the api sees both enums, so only here can they be held together.
describe('the contract against the database', () => {
	it('has the same sides on both sides', () => {
		expect(
			[...LISTING_COMMENT_SIDES].map(side => side.toUpperCase()).sort(),
		).toEqual(Object.values(PrismaListingCommentSide).sort())
	})

	it.each(LISTING_COMMENT_SIDES)('maps %s both ways', side => {
		expect(toDomainSide(toPrismaSide(side))).toBe(side)
	})
})
