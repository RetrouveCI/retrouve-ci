import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../shared/pagination'
import { listContactMessagesFilterSchema } from '../list-filter.schema'

const parse = (input: unknown) =>
	listContactMessagesFilterSchema.safeParse(input)

describe('listContactMessagesFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it('accepts a status, and the strings a query string carries', () => {
		expect(parse({ status: 'read', page: '2', pageSize: '5' }).data).toEqual({
			status: 'read',
			page: 2,
			pageSize: 5,
		})
	})

	// Every message a caller can see must be French, enum defaults included.
	it('refuses an unknown status, in French', () => {
		const result = parse({ status: 'supprime' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})

	it('still enforces the pagination ceiling', () => {
		expect(parse({ pageSize: 1000 }).success).toBe(false)
	})
})
