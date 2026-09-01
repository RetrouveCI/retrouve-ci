import type { UserLostItem } from '@/shared/types/lost-item'
import {
	LISTING_STATUS,
	UNKNOWN_LISTING_STATUS,
	listingStatusFor,
} from '../listing-status'

const listing = (overrides: Partial<UserLostItem> = {}): UserLostItem => ({
	id: 'post-1',
	title: 'Sac à dos noir',
	description: 'Oublié dans un gbaka',
	location: 'Cocody, Abidjan',
	date: 'Il y a 5 jours',
	type: 'lost',
	category: 'bag',
	status: 'active',
	moderationStatus: 'published',
	createdAt: '2026-08-01T09:00:00.000Z',
	views: 48,
	contacts: 3,
	...overrides,
})

describe('listingStatusFor', () => {
	// §2.3 rule 1: the axis the owner does not choose is the one that shows.
	it.each(['pending', 'hidden'] as const)(
		'lets moderation win over the lifecycle when %s',
		moderationStatus => {
			expect(
				listingStatusFor(listing({ moderationStatus, status: 'active' })),
			).toBe(LISTING_STATUS[moderationStatus])
		},
	)

	it.each(['active', 'resolved', 'expired'] as const)(
		'reads the lifecycle of a published %s listing',
		status => {
			expect(listingStatusFor(listing({ status }))).toBe(LISTING_STATUS[status])
		},
	)

	// A published, live listing is the normal case, so it carries no badge.
	it('labels nothing on the normal case', () => {
		expect(listingStatusFor(listing()).label).toBeNull()
	})

	/**
	 * The debt R12 left open: `STATUS_CONFIG[displayStatus]` had no fallback, so
	 * a status outside the enumeration took the page down with a 500 — measured
	 * for real by serving the Prisma values in upper case.
	 */
	it('falls back instead of failing on a status it does not know', () => {
		const rogue = { ...listing(), status: 'ACTIVE' } as unknown as UserLostItem

		expect(listingStatusFor(rogue)).toBe(UNKNOWN_LISTING_STATUS)
	})
})
