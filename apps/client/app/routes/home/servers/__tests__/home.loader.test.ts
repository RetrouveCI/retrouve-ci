import type { LostItemApiDto } from '@/shared/types/lost-items.types'

const { getLostItems } = vi.hoisted(() => ({ getLostItems: vi.fn() }))

vi.mock('../../../posts/servers/lost-items.service', () => ({ getLostItems }))

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
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'published',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		createdAt: '2026-08-30T10:00:00.000Z',
	}
}

beforeEach(() => {
	getLostItems.mockReset()
})

describe('homeLoader', () => {
	it('asks for exactly the strip it draws', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		await homeLoader()

		expect(getLostItems).toHaveBeenCalledWith({
			pageSize: RECENT_LISTINGS_COUNT,
		})
	})

	it('carries the published total the counter reads', async () => {
		getLostItems.mockResolvedValue({
			items: [dto('a'), dto('b')],
			total: 412,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		const { recent } = await homeLoader()

		expect(recent?.total).toBe(412)
		expect(recent?.listings.map(item => item.id)).toEqual(['a', 'b'])
	})

	it('tells an empty listing apart from a failed one', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		const { recent } = await homeLoader()

		expect(recent).not.toBeNull()
		expect(recent?.listings).toEqual([])
	})

	it('leaves the home page standing when the API is unreachable', async () => {
		getLostItems.mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(homeLoader()).resolves.toEqual({ recent: null })
	})
})
