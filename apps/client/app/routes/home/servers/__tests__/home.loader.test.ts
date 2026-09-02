import type { LostItemApiDto } from '@/shared/types/lost-items.types'

const { getLostItems, getServerSession, getMyStickerSummary } = vi.hoisted(
	() => ({
		getLostItems: vi.fn(),
		getServerSession: vi.fn(),
		getMyStickerSummary: vi.fn(),
	}),
)

vi.mock('../../../posts/servers/lost-items.service', () => ({ getLostItems }))
vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../../../account/stickers/servers/stickers.service', () => ({
	getMyStickerSummary,
}))

const { homeLoader, RECENT_LISTINGS_COUNT } = await import('../home.loader')

const request = new Request('http://localhost/')

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
	getServerSession.mockReset().mockResolvedValue(null)
	getMyStickerSummary.mockReset()
})

describe('homeLoader', () => {
	it('asks for exactly the strip it draws', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})

		await homeLoader({ request })

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

		const { recent } = await homeLoader({ request })

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

		const { recent } = await homeLoader({ request })

		expect(recent).not.toBeNull()
		expect(recent?.listings).toEqual([])
	})

	it('leaves the home page standing when the API is unreachable', async () => {
		getLostItems.mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(homeLoader({ request })).resolves.toEqual({
			recent: null,
			stickers: null,
		})
	})
})

describe('homeLoader — the sticker banner', () => {
	function published() {
		getLostItems.mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: RECENT_LISTINGS_COUNT,
		})
	}

	it('asks the API nothing about stickers for an anonymous visitor', async () => {
		published()

		const { stickers } = await homeLoader({ request })

		expect(stickers).toBeNull()
		expect(getMyStickerSummary).not.toHaveBeenCalled()
	})

	it('carries the summary for a signed-in visitor', async () => {
		published()
		getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
		getMyStickerSummary.mockResolvedValue({
			delivered: 12,
			activated: 3,
			pending: 9,
		})

		const { stickers } = await homeLoader({ request })

		expect(stickers).toEqual({ delivered: 12, activated: 3, pending: 9 })
	})

	/** A banner must never take the first screen of the product down. */
	it('drops the banner rather than the page when the summary fails', async () => {
		published()
		getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
		getMyStickerSummary.mockRejectedValue(new Error('ECONNREFUSED'))

		const { recent, stickers } = await homeLoader({ request })

		expect(stickers).toBeNull()
		expect(recent).not.toBeNull()
	})

	it('drops the banner when the session check itself throws', async () => {
		published()
		getServerSession.mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(homeLoader({ request })).resolves.toMatchObject({
			stickers: null,
		})
	})
})
