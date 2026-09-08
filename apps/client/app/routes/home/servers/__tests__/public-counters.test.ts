import type { PublicCountersApiResponse } from '../counters.service'

const { getPublicCounters } = vi.hoisted(() => ({
	getPublicCounters: vi.fn(),
}))

vi.mock('../counters.service', () => ({ getPublicCounters }))

const { loadPublicCounters } = await import('../public-counters')

const request = new Request('http://localhost:3000/login')

beforeEach(() => {
	getPublicCounters.mockReset()
})

describe('loadPublicCounters', () => {
	it('hands back what the API answered', async () => {
		const answered: PublicCountersApiResponse = {
			published: 412,
			resolvedThisMonth: 37,
		}
		getPublicCounters.mockResolvedValue(answered)

		expect(await loadPublicCounters(request)).toEqual(answered)
	})

	// ⚠️ Why it exists: these sit on the sign-in panel. `null` and not zero — a
	// screen draws no band rather than announcing nothing happened.
	it.each([
		['an unreachable API', new Error('ECONNREFUSED')],
		['a refusal', new Error('500')],
	])('answers null on %s', async (_name, error) => {
		getPublicCounters.mockRejectedValue(error)

		expect(await loadPublicCounters(request)).toBeNull()
	})
})
