import { PHRASE_MAX_LENGTH } from '@app/contracts/search-assistant'
import { looksLikePhrase } from '../phrase'

describe('what counts as a phrase', () => {
	// The whole point of the heuristic: these already have an answer that costs
	// nothing, and the assistant's ceiling is five a quarter of an hour.
	it.each([
		'carte',
		'CNI',
		'carte identité',
		'CNI Cocody',
		'téléphone perdu Abidjan',
	])('spends nothing on « %s »', value => {
		expect(looksLikePhrase(value)).toBe(false)
	})

	it.each([
		"j'ai perdu ma carte d'identité",
		"j'ai perdu mon téléphone à Cocody hier",
		'sac noir oublié dans un taxi mardi dernier',
	])('reads « %s » as a phrase', value => {
		expect(looksLikePhrase(value)).toBe(true)
	})

	it('counts words, not spaces', () => {
		expect(looksLikePhrase('   un   deux   trois   ')).toBe(false)
		expect(looksLikePhrase('   un   deux   trois  quatre  ')).toBe(true)
	})

	it('says no to nothing at all', () => {
		expect(looksLikePhrase('')).toBe(false)
		expect(looksLikePhrase('   ')).toBe(false)
	})

	// A round-trip the API would answer with a `400` is not one worth making.
	it('refuses what the contract would refuse', () => {
		const tooLong = 'a '.repeat(PHRASE_MAX_LENGTH)

		expect(tooLong.trim().split(/\s+/).length).toBeGreaterThan(4)
		expect(looksLikePhrase(tooLong)).toBe(false)
	})
})
