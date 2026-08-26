import { ApiError } from '@/shared/utils/api-fetch'

const { getLostItemById } = vi.hoisted(() => ({ getLostItemById: vi.fn() }))

vi.mock('../../../servers/lost-items.service', () => ({ getLostItemById }))

const { postDetailLoader } = await import('../lost-items.loader')

const DTO = {
	id: 'post-1',
	title: 'Sac à dos noir',
	description: 'Perdu près du marché de Cocody.',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: '2026-08-01T10:00:00.000Z',
	type: 'lost',
	category: 'bag',
	photos: ['https://cdn/a.jpg'],
	contactName: 'Awa Traoré',
	contactWhatsapp: '+2250700000000',
}

const load = () =>
	postDetailLoader({ params: { id: 'post-1' } } as Parameters<
		typeof postDetailLoader
	>[0])

const statusOf = (value: unknown) =>
	value instanceof Response
		? value.status
		: (value as { init?: { status?: number } })?.init?.status

beforeEach(() => {
	getLostItemById.mockReset().mockResolvedValue(DTO)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('postDetailLoader', () => {
	it('reads the listing named in the url', async () => {
		await load()

		expect(getLostItemById).toHaveBeenCalledWith('post-1')
	})

	it('hands the page the mapped listing', async () => {
		const { listing } = await load()

		expect(listing).toMatchObject({
			id: 'post-1',
			title: 'Sac à dos noir',
			location: 'Cocody, Abidjan',
			dateISO: '2026-08-01',
		})
	})

	// The contact block is the point of the page.
	it('carries the poster contact through', async () => {
		const { listing } = await load()

		expect(listing.contact).toEqual({
			name: 'Awa Traoré',
			method: '+2250700000000',
		})
	})

	// A deleted or unpublished listing must render the 404 page, not an error.
	it('turns the API 404 into a 404 response', async () => {
		getLostItemById.mockRejectedValue(new ApiError(404, 'Introuvable'))

		const thrown = await load().catch((error: unknown) => error)

		expect(statusOf(thrown)).toBe(404)
	})

	it.each([500, 502])(
		'lets a %s through rather than reporting it as missing',
		async status => {
			const error = new ApiError(status, 'Panne')
			getLostItemById.mockRejectedValue(error)

			await expect(load()).rejects.toBe(error)
		},
	)

	it('lets a non-API failure through', async () => {
		const error = new Error('boom')
		getLostItemById.mockRejectedValue(error)

		await expect(load()).rejects.toBe(error)
	})
})
