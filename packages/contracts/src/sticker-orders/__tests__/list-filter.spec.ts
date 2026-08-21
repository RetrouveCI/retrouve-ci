import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../shared/pagination'
import { listStickerOrdersFilterSchema } from '../list-filter.schema'

const parse = (input: unknown) => listStickerOrdersFilterSchema.safeParse(input)

describe('listStickerOrdersFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it('accepts a status, and the strings a query string carries', () => {
		expect(parse({ status: 'shipped', page: '2', pageSize: '5' }).data).toEqual(
			{
				status: 'shipped',
				page: 2,
				pageSize: 5,
			},
		)
	})

	it('refuses an unknown status, in French', () => {
		const result = parse({ status: 'rembourse' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})

	it('still enforces the pagination bounds', () => {
		expect(parse({ pageSize: 1000 }).success).toBe(false)
		expect(parse({ page: 0 }).success).toBe(false)
	})
})
