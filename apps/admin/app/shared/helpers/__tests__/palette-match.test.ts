import { matchesQuery, normalizeForSearch } from '../palette-match'

describe('normalizeForSearch', () => {
	it('drops the accents and the case', () => {
		expect(normalizeForSearch('  Modération  ')).toBe('moderation')
	})
})

describe('matchesQuery', () => {
	it('finds a label typed without its accents', () => {
		expect(matchesQuery('Modération', 'moder')).toBe(true)
	})

	it('finds a keyword as well as the label', () => {
		expect(matchesQuery('Annonces posts moderation', 'MODÉR')).toBe(true)
	})

	it('matches everything on an empty query', () => {
		expect(matchesQuery('Commandes', '   ')).toBe(true)
	})

	it('refuses what the text does not hold', () => {
		expect(matchesQuery('Commandes', 'sticker')).toBe(false)
	})
})
