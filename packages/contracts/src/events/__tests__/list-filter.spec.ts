import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../shared/pagination'
import {
	adminListEventsFilterSchema,
	listEventsFilterSchema,
} from '../list-filter.schema'

describe('listEventsFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(listEventsFilterSchema.safeParse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	// The public list is always filtered to `published` by the controller, so a
	// visitor must not be able to ask for the drafts through the query string.
	it('drops a status a visitor supplies', () => {
		expect(listEventsFilterSchema.safeParse({ status: 'draft' }).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})
})

describe('adminListEventsFilterSchema', () => {
	const parse = (input: unknown) => adminListEventsFilterSchema.safeParse(input)

	it('accepts a status, and the strings a query string carries', () => {
		expect(
			parse({ status: 'cancelled', page: '2', pageSize: '5' }).data,
		).toEqual({ status: 'cancelled', page: 2, pageSize: 5 })
	})

	it('refuses an unknown status, in French', () => {
		const result = parse({ status: 'supprime' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})

	it('still enforces the pagination ceiling', () => {
		expect(parse({ pageSize: 1000 }).success).toBe(false)
		expect(parse({ page: 0 }).success).toBe(false)
	})
})
