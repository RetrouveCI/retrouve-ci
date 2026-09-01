import type { UserLostItem } from '@/shared/types/lost-item'
import { buildContactsLabel, buildTimelineLabel } from '../listing-labels'

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
	createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
	views: 48,
	contacts: 3,
	...overrides,
})

describe('buildTimelineLabel', () => {
	it('pairs the place with how long the listing has been up', () => {
		expect(buildTimelineLabel(listing())).toBe(
			'Cocody, Abidjan · publiée il y a 3 jours',
		)
	})

	// A listing awaiting validation has not been published: it was sent.
	it('says « envoyée » while the listing awaits validation', () => {
		expect(buildTimelineLabel(listing({ moderationStatus: 'pending' }))).toBe(
			'Cocody, Abidjan · envoyée il y a 3 jours',
		)
	})

	it('dates a hidden listing from its publication like any other', () => {
		expect(
			buildTimelineLabel(listing({ moderationStatus: 'hidden' })),
		).toContain('publiée il y a 3 jours')
	})
})

describe('buildContactsLabel', () => {
	it.each([
		[0, 'Personne ne vous a écrit'],
		[1, '1 personne vous a écrit'],
		[3, '3 personnes vous ont écrit'],
	])('agrees the verb for %i contacts', (contacts, expected) => {
		expect(buildContactsLabel(contacts)).toBe(expected)
	})
})
