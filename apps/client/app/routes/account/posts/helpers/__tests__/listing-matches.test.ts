import type { LostItem, UserLostItem } from '@/shared/types/lost-item'
import type { ListingMatches } from '../../types/matches'
import {
	acceptsMatches,
	buildMatchesSubtitle,
	buildMatchesTitle,
} from '../listing-matches'

const listing = (overrides: Partial<UserLostItem> = {}): UserLostItem => ({
	id: 'post-1',
	title: 'Sac à dos noir',
	description: 'Oublié dans un gbaka',
	location: 'Abidjan, Cocody',
	date: '12 janvier 2026',
	type: 'lost',
	category: 'bag',
	status: 'active',
	moderationStatus: 'published',
	createdAt: '2026-01-12',
	views: 1,
	contacts: 1,
	...overrides,
})

const candidate = (ville: string): LostItem => ({
	id: `found-${ville}`,
	title: 'Sac trouvé',
	description: 'Ramassé sur le trottoir',
	location: ville,
	ville,
	date: 'Il y a 2 jours',
	type: 'found',
	category: 'bag',
})

const matches = (items: LostItem[], count = items.length): ListingMatches => ({
	count,
	items,
})

describe('acceptsMatches', () => {
	it('accepts a published listing that is still live', () => {
		expect(acceptsMatches(listing())).toBe(true)
	})

	it.each(['pending', 'hidden'] as const)(
		'refuses a %s listing, which the endpoint would answer with an error',
		moderationStatus => {
			expect(acceptsMatches(listing({ moderationStatus }))).toBe(false)
		},
	)

	it.each(['resolved', 'expired'] as const)(
		'refuses a %s listing: its owner is no longer looking',
		status => {
			expect(acceptsMatches(listing({ status }))).toBe(false)
		},
	)
})

describe('buildMatchesTitle', () => {
	it('looks for found objects when the listing is a loss', () => {
		expect(buildMatchesTitle(2, 'lost')).toBe(
			'2 objets trouvés pourraient correspondre',
		)
	})

	it('looks for lost objects when the listing is a find', () => {
		expect(buildMatchesTitle(3, 'found')).toBe(
			'3 objets perdus pourraient correspondre',
		)
	})

	it('says a single match in the singular', () => {
		expect(buildMatchesTitle(1, 'lost')).toBe(
			'1 objet trouvé pourrait correspondre',
		)
	})
})

describe('buildMatchesSubtitle', () => {
	it('names the town when every listed candidate shares it', () => {
		expect(
			buildMatchesSubtitle(
				matches([candidate('Cocody'), candidate('Cocody')]),
				'Cocody',
			),
		).toBe('Signalés à Cocody')
	})

	it('agrees in the singular on a lone candidate', () => {
		expect(buildMatchesSubtitle(matches([candidate('Cocody')]), 'Cocody')).toBe(
			'Signalé à Cocody',
		)
	})

	it('ignores the case the two towns were typed in', () => {
		expect(buildMatchesSubtitle(matches([candidate('cocody')]), 'Cocody')).toBe(
			'Signalé à Cocody',
		)
	})

	it('falls back when one candidate comes from elsewhere', () => {
		expect(
			buildMatchesSubtitle(
				matches([candidate('Cocody'), candidate('Yopougon')]),
				'Cocody',
			),
		).toBe('Même catégorie ou même ville')
	})

	/** The town would describe the four shown, not the seven counted. */
	it('falls back when the sheet shows less than it counts', () => {
		expect(
			buildMatchesSubtitle(matches([candidate('Cocody')], 7), 'Cocody'),
		).toBe('Même catégorie ou même ville')
	})

	it('falls back when the listing has no town', () => {
		expect(
			buildMatchesSubtitle(matches([candidate('Cocody')]), undefined),
		).toBe('Même catégorie ou même ville')
	})
})
