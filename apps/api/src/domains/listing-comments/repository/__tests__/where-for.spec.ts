import { ListingCommentSide as PrismaListingCommentSide } from '@app/database'
import { describe, expect, it } from 'vitest'
import { DESK, POSTER } from '../../__tests__/listing-comment.fixture'
import { unreadFor, whereFor } from '../listing-comment.repository'

// Everything above only passes a scope down, and would keep passing it down if
// this clause stopped naming the owner. So it is asserted here.
describe('the clause every thread read is built from', () => {
	it('bounds a poster to the listings they own', () => {
		expect(whereFor(POSTER)).toEqual({ lostItem: { userId: 'user-1' } })
	})

	it('lets the desk read every thread', () => {
		expect(whereFor(DESK)).toEqual({})
	})
})

describe('what a side has yet to read', () => {
	it('is what the desk wrote, on the poster’s own listings only', () => {
		expect(unreadFor(POSTER)).toEqual({
			lostItem: { userId: 'user-1' },
			authorSide: PrismaListingCommentSide.ADMIN,
			readAt: null,
		})
	})

	it('is what the posters wrote, for the desk', () => {
		expect(unreadFor(DESK)).toEqual({
			authorSide: PrismaListingCommentSide.OWNER,
			readAt: null,
		})
	})
})
