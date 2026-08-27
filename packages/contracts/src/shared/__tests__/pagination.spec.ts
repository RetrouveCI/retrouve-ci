import { describe, expect, it } from 'vitest'
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	paginationQuerySchema,
} from '../pagination'

const parse = (input: unknown) => paginationQuerySchema.safeParse(input)

const messageFor = (input: unknown) => {
	const result = parse(input)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('paginationQuerySchema', () => {
	it('falls back to the defaults when nothing is asked for', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it.each([
		['strings, as a query string carries them', { page: '3', pageSize: '50' }],
		['numbers, as a front-end holds them', { page: 3, pageSize: 50 }],
	])('accepts %s', (_label, input) => {
		expect(parse(input).data).toEqual({ page: 3, pageSize: 50 })
	})

	it('refuses a page size above the ceiling, and accepts the ceiling itself', () => {
		expect(messageFor({ pageSize: MAX_PAGE_SIZE + 1 })).toBe(
			`Maximum ${MAX_PAGE_SIZE} éléments par page`,
		)
		expect(parse({ pageSize: MAX_PAGE_SIZE }).data?.pageSize).toBe(
			MAX_PAGE_SIZE,
		)
	})

	it('refuses a page below one', () => {
		expect(messageFor({ page: 0 })).toBe('La page commence à 1')
		expect(parse({ page: 1 }).data?.page).toBe(1)
	})

	it.each([
		['a negative page', { page: '-1' }],
		['a decimal', { pageSize: 2.5 }],
		['a non-numeric string', { page: 'beaucoup' }],
		['a boolean', { page: true }],
		['null', { pageSize: null }],
	])('refuses %s', (_label, input) => {
		expect(parse(input).success).toBe(false)
	})

	it('answers in French, never zod English', () => {
		expect(messageFor({ page: 'beaucoup' })).toBe('Doit être un entier positif')
	})
})
