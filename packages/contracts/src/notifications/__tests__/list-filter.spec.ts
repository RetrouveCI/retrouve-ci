import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../shared/pagination'
import { listNotificationsFilterSchema } from '../list-filter.schema'

const parse = (input: unknown) => listNotificationsFilterSchema.safeParse(input)

describe('listNotificationsFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	// No `read` means no filter at all — not `read: false`, which would hide every
	// notification a user has already opened.
	it('leaves read undefined when the query string omits it', () => {
		expect(parse({}).data?.read).toBeUndefined()
	})

	it.each([
		['true', true],
		['false', false],
	])('reads the query string %s as %s', (input, expected) => {
		expect(parse({ read: input }).data?.read).toBe(expected)
	})

	it('accepts a real boolean, for a caller that is not a query string', () => {
		expect(parse({ read: true }).data?.read).toBe(true)
		expect(parse({ read: false }).data?.read).toBe(false)
	})

	// The DTO this replaces turned every one of these into `false` and answered
	// 200, so `read=1` silently listed the unread ones.
	it.each(['oui', '1', '0', 'TRUE', ''])(
		'refuses read=%s instead of reading it as false',
		read => {
			const result = parse({ read })

			expect(result.success).toBe(false)
			expect(result.error?.issues[0]?.message).toBe('Doit valoir true ou false')
		},
	)

	it('still enforces the pagination bounds', () => {
		expect(parse({ pageSize: 1000 }).success).toBe(false)
		expect(parse({ page: 0 }).success).toBe(false)
		expect(parse({ read: 'true', page: '2', pageSize: '5' }).data).toEqual({
			read: true,
			page: 2,
			pageSize: 5,
		})
	})
})
