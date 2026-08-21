import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../shared/pagination'
import { listQrTokensFilterSchema } from '../list-filter.schema'
import { QR_TOKEN_STATUSES } from '../qr-codes.const'
import { qrTokenStatusSchema } from '../status.schema'

const parse = (input: unknown) => listQrTokensFilterSchema.safeParse(input)

describe('qrTokenStatusSchema', () => {
	it.each(QR_TOKEN_STATUSES)('accepts %s', status => {
		expect(qrTokenStatusSchema.safeParse(status).success).toBe(true)
	})

	it('refuses an unknown status, in French', () => {
		expect(
			qrTokenStatusSchema.safeParse('perime').error?.issues[0]?.message,
		).toBe('Statut invalide')
	})
})

describe('listQrTokensFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it('accepts a status, and the strings a query string carries', () => {
		expect(
			parse({ status: 'activated', page: '2', pageSize: '5' }).data,
		).toEqual({ status: 'activated', page: 2, pageSize: 5 })
	})

	it('refuses an unknown status, in French', () => {
		expect(parse({ status: 'perime' }).error?.issues[0]?.message).toBe(
			'Statut invalide',
		)
	})

	it('still enforces the pagination bounds', () => {
		expect(parse({ pageSize: 1000 }).success).toBe(false)
		expect(parse({ page: 0 }).success).toBe(false)
	})
})
