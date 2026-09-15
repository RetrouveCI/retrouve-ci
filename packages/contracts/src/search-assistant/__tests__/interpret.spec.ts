import { describe, expect, it } from 'vitest'
import { ABIDJAN_COMMUNES, CI_VILLES } from '../../shared/locations'
import {
	assistantSearchFiltersSchema,
	interpretSearchPhraseSchema,
} from '../interpret.schema'
import { PHRASE_MAX_LENGTH, PHRASE_MIN_LENGTH } from '../search-assistant.const'

describe('the phrase a visitor submits', () => {
	it('trims it before measuring it', () => {
		const result = interpretSearchPhraseSchema.safeParse({
			phrase: '  carte perdue à Cocody  ',
		})

		expect(result.data?.phrase).toBe('carte perdue à Cocody')
	})

	it.each([
		['too short', 'a'.repeat(PHRASE_MIN_LENGTH - 1)],
		['too long', 'a'.repeat(PHRASE_MAX_LENGTH + 1)],
	])('refuses one %s', (_, phrase) => {
		expect(interpretSearchPhraseSchema.safeParse({ phrase }).success).toBe(
			false,
		)
	})

	it('answers in French when the field is missing', () => {
		const result = interpretSearchPhraseSchema.safeParse({})

		expect(result.error?.issues[0]?.message).toBe('La phrase est requise')
	})
})

describe('the filters the assistant may answer', () => {
	it('takes nothing at all', () => {
		expect(assistantSearchFiltersSchema.safeParse({}).success).toBe(true)
	})

	it('takes a place the app knows', () => {
		const result = assistantSearchFiltersSchema.safeParse({
			ville: CI_VILLES[0],
			commune: ABIDJAN_COMMUNES[0],
		})

		expect(result.success).toBe(true)
	})

	// The invariant: a model naming a place the app does not serve would send
	// the search somewhere no listing can be.
	it.each([
		['ville', { ville: 'Paris' }],
		['commune', { commune: 'Montmartre' }],
	])('refuses a %s it has never heard of', (_, filters) => {
		expect(assistantSearchFiltersSchema.safeParse(filters).success).toBe(false)
	})

	it('refuses a category outside the catalogue', () => {
		const result = assistantSearchFiltersSchema.safeParse({
			category: 'jewellery',
		})

		expect(result.success).toBe(false)
	})

	it('refuses a day that does not exist', () => {
		const result = assistantSearchFiltersSchema.safeParse({
			dateFrom: '2026-02-31',
		})

		expect(result.success).toBe(false)
	})

	it('refuses an empty search term rather than filtering on nothing', () => {
		expect(assistantSearchFiltersSchema.safeParse({ search: '' }).success).toBe(
			false,
		)
	})
})
