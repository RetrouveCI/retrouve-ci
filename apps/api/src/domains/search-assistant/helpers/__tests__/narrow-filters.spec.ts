import { describe, expect, it } from 'vitest'
import { narrowAssistantFilters } from '../narrow-filters'

describe('narrowing what the model answered', () => {
	it('reads a bare object', () => {
		expect(narrowAssistantFilters('{"type":"lost"}')).toEqual({ type: 'lost' })
	})

	it('reads one wrapped in prose or a code fence', () => {
		const text = 'Voici :\n```json\n{"category":"phone"}\n```\nVoilà.'

		expect(narrowAssistantFilters(text)).toEqual({ category: 'phone' })
	})

	it.each([
		['nothing at all', ''],
		['prose with no object', "je n'ai pas compris"],
		['broken JSON', '{"type":"lost"'],
		['a bare value', '5'],
		['several objects at once', '[{"type":"lost"},{"type":"found"}]'],
	])('answers no filter for %s', (_, text) => {
		expect(narrowAssistantFilters(text)).toEqual({})
	})

	// Reading from the first brace to the last is what tolerates a fence or a
	// sentence around the answer; a lone object inside a list falls out of that
	// same rule rather than being a case of its own.
	it('reads the one object of a single-element list', () => {
		expect(narrowAssistantFilters('[{"type":"lost"}]')).toEqual({
			type: 'lost',
		})
	})

	// The invariant: a place the app does not serve would send the search
	// somewhere no listing can be — and dropping is per field, so the rest of a
	// good answer survives one bad value.
	it('drops an invented city and keeps what was right', () => {
		const filters = narrowAssistantFilters(
			'{"ville":"Paris","category":"documents"}',
		)

		expect(filters).toEqual({ category: 'documents' })
	})

	it.each([
		['a category outside the catalogue', '{"category":"jewellery"}'],
		['a type that is neither lost nor found', '{"type":"stolen"}'],
		['a day that does not exist', '{"dateFrom":"2026-02-31"}'],
		['a number where a word belongs', '{"category":7}'],
		['an empty search term', '{"search":""}'],
		['a field nobody declared', '{"colour":"noir"}'],
		['a null, which a model writes freely', '{"ville":null}'],
	])('drops %s', (_, text) => {
		expect(narrowAssistantFilters(text)).toEqual({})
	})

	it('trims a value it keeps', () => {
		expect(narrowAssistantFilters('{"ville":"  Abidjan  "}')).toEqual({
			ville: 'Abidjan',
		})
	})

	it('keeps a commune named beside its own city', () => {
		const filters = narrowAssistantFilters(
			'{"ville":"Abidjan","commune":"Cocody"}',
		)

		expect(filters).toEqual({ ville: 'Abidjan', commune: 'Cocody' })
	})

	// The commune list belongs to one city, which the contract states, so this
	// is a derivation and not a guess.
	it('completes the city of a commune named on its own', () => {
		expect(narrowAssistantFilters('{"commune":"Yopougon"}')).toEqual({
			ville: 'Abidjan',
			commune: 'Yopougon',
		})
	})

	it('drops a commune named beside another city', () => {
		expect(
			narrowAssistantFilters('{"ville":"Bouaké","commune":"Cocody"}'),
		).toEqual({ ville: 'Bouaké' })
	})

	it('takes a whole answer', () => {
		const text = `{"type":"found","category":"phone","ville":"Abidjan",
			"commune":"Marcory","search":"samsung noir","dateFrom":"2026-09-01",
			"dateTo":"2026-09-15"}`

		expect(narrowAssistantFilters(text)).toEqual({
			type: 'found',
			category: 'phone',
			ville: 'Abidjan',
			commune: 'Marcory',
			search: 'samsung noir',
			dateFrom: '2026-09-01',
			dateTo: '2026-09-15',
		})
	})
})
