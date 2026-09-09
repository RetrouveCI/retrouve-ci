import { formatRelativeDate } from '@/shared/utils/date'
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
	createdAt: '2026-08-20T10:00:00.000Z',
	type: 'lost',
	category: 'bag',
	photos: ['https://cdn/a.jpg'],
	contactName: 'Awa Traoré',
	contactReachable: true,
}

const load = (search = '') =>
	postDetailLoader({
		params: { id: 'post-1' },
		request: new Request(`http://localhost:3000/posts/post-1${search}`),
	} as Parameters<typeof postDetailLoader>[0])

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

		expect(getLostItemById).toHaveBeenCalledWith('post-1', expect.any(Request))
	})

	it('hands the page the mapped listing', async () => {
		const { listing } = await load()

		expect(listing).toMatchObject({
			id: 'post-1',
			title: 'Sac à dos noir',
			location: 'Cocody, Abidjan',
			eventDate: '1 août 2026',
		})
	})

	// ⚠️ It used to come from `eventDate`. The fixture's two dates are 19 days
	// apart, so neither can pass for the other.
	it('counts the relative line from the posting date, not the loss date', async () => {
		const { listing } = await load()

		expect(listing.postedAt).toBe(
			formatRelativeDate('2026-08-20T10:00:00.000Z'),
		)
		expect(listing.postedAt).not.toBe(
			formatRelativeDate('2026-08-01T10:00:00.000Z'),
		)
	})

	it('carries the poster name, and whether they can be reached', async () => {
		const { listing } = await load()

		expect(listing.contact).toEqual({ name: 'Awa Traoré' })
		expect(listing.contactReachable).toBe(true)
		expect(listing).not.toHaveProperty('contactWhatsapp')
	})

	// A deleted or unpublished listing must render the 404 page, not an error.
	it.each(['failed', 'throttled'])(
		'carries a %s contact back to the page',
		async outcome => {
			expect((await load(`?contact=${outcome}`)).contact).toBe(outcome)
		},
	)

	it.each(['', '?contact=', '?contact=nope'])(
		'answers no outcome for %s',
		async search => {
			expect((await load(search)).contact).toBeNull()
		},
	)

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
