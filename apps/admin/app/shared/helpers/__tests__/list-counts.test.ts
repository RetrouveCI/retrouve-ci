import { countByStatus } from '../list-counts'

const STATUSES = ['pending', 'shipped'] as const

describe('countByStatus', () => {
	it('counts every row, then each status', async () => {
		const totals = { all: 12, pending: 3, shipped: 9 }
		const count = vi.fn(async (status?: 'pending' | 'shipped') =>
			status ? totals[status] : totals.all,
		)

		await expect(countByStatus(STATUSES, count)).resolves.toEqual(totals)
		expect(count).toHaveBeenCalledTimes(3)
	})

	// A zero would claim a measurement; `null` lets the page say it has none.
	it('reads a counter the API cannot serve as absent', async () => {
		const count = vi.fn(async (status?: string) => {
			if (status === 'shipped') throw new Error('unreachable')
			return 1
		})

		await expect(countByStatus(STATUSES, count)).resolves.toBeNull()
	})
})
