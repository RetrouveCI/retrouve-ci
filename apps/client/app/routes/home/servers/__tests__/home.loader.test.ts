import type { LostItemApiDto } from '@/shared/types/lost-items.types'

const { getLostItems, getPublicCounters } = vi.hoisted(() => ({
	getLostItems: vi.fn(),
	getPublicCounters: vi.fn(),
}))

vi.mock('../../../posts/servers/lost-items.service', () => ({ getLostItems }))
vi.mock('../counters.service', () => ({ getPublicCounters }))

const { homeLoader, RECENT_LISTINGS_COUNT } = await import('../home.loader')

function dto(id: string): LostItemApiDto {
	return {
		id,
		type: 'lost',
		category: 'phone',
		title: 'Téléphone Tecno noir',
		description: 'Perdu dans un gbaka.',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: '2026-08-30T10:00:00.000Z',
		contactName: 'Awa',
		contactReachable: true,
		photos: [],
		documentType: null,
		documentHolderName: null,
		documentIssuer: null,
		moderationStatus: 'published',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		createdAt: '2026-08-30T10:00:00.000Z',
	}
}

const args = { request: new Request('http://localhost:3000/') }

beforeEach(() => {
	getLostItems.mockReset()
	getPublicCounters.mockReset().mockResolvedValue({
		published: 0,
		resolvedThisMonth: 0,
	})
})

describe('homeLoader', () => {
	it('asks for exactly the strip it draws', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		await homeLoader(args)

		expect(getLostItems).toHaveBeenCalledWith(
			{ pageSize: RECENT_LISTINGS_COUNT },
			args.request,
		)
	})

	it('maps the listings the strip shows', async () => {
		getLostItems.mockResolvedValue({
			items: [dto('a'), dto('b')],
			total: 412,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		const { recent } = await homeLoader(args)

		expect(recent?.listings.map(item => item.id)).toEqual(['a', 'b'])
	})

	// ⚠️ The badge used to read the list response's `total`, which counts what
	// that query matched. The list's total is deliberately ignored now.
	it('takes the count from the counters endpoint, not from the list', async () => {
		getLostItems.mockResolvedValue({
			items: [dto('a')],
			total: 412,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})
		getPublicCounters.mockResolvedValue({
			published: 37,
			resolvedThisMonth: 4,
		})

		const { counters } = await homeLoader(args)

		expect(counters).toEqual({ published: 37, resolvedThisMonth: 4 })
	})

	// An unreachable counter must leave the page standing, as a list already does.
	it('answers null counters when the endpoint cannot be reached', async () => {
		getPublicCounters.mockRejectedValue(new Error('boom'))

		expect((await homeLoader(args)).counters).toBeNull()
	})

	it('tells an empty listing apart from a failed one', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		const { recent } = await homeLoader(args)

		expect(recent).not.toBeNull()
		expect(recent?.listings).toEqual([])
	})

	it('leaves the home page standing when the API is unreachable', async () => {
		getLostItems.mockRejectedValue(new Error('ECONNREFUSED'))
		getPublicCounters.mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(homeLoader(args)).resolves.toEqual({
			recent: null,
			counters: null,
		})
	})

	// It left with the banner it fed; the shell reads it beside the page now.
	it('reads nothing about stickers any more', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		expect(Object.keys(await homeLoader(args))).toEqual(['recent', 'counters'])
	})
})
