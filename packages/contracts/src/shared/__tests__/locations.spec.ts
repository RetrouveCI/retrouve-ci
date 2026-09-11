import { describe, expect, it } from 'vitest'
import { ABIDJAN_COMMUNES, CI_VILLES, COMMUNE_CITY } from '../locations'

describe('the location lists', () => {
	// Otherwise the commune select would never enable, on either front-end.
	it('names a commune city that is one of the cities', () => {
		expect(CI_VILLES).toContain(COMMUNE_CITY)
	})

	it.each([
		['CI_VILLES', CI_VILLES],
		['ABIDJAN_COMMUNES', ABIDJAN_COMMUNES],
	])('%s holds no duplicate', (_, list) => {
		expect(new Set(list).size).toBe(list.length)
	})
})
