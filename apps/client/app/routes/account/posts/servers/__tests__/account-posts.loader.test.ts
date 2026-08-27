const { requireServerSession, getMyLostItems } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getMyLostItems: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../account-posts.service', () => ({ getMyLostItems }))

const { accountPostsLoader } = await import('../account-posts.loader')

const request = () => new Request('http://localhost:3000/account/posts')

const dto = (overrides: Record<string, unknown> = {}) => ({
	id: 'post-1',
	title: 'Sac à dos noir',
	description: 'Perdu près du marché.',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: '2026-08-01T10:00:00.000Z',
	type: 'lost',
	category: 'bag',
	photos: [],
	resolutionStatus: 'active',
	moderationStatus: 'published',
	createdAt: '2026-08-01T09:00:00.000Z',
	views: 12,
	contactsCount: 3,
	...overrides,
})

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getMyLostItems.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('accountPostsLoader', () => {
	it('gates on the session before reading anything', async () => {
		const req = request()

		await accountPostsLoader({ request: req })

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('does not read the listings when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(accountPostsLoader({ request: request() })).rejects.toBe(
			redirect,
		)
		expect(getMyLostItems).not.toHaveBeenCalled()
	})

	it('reports an empty account as no listing', async () => {
		expect(await accountPostsLoader({ request: request() })).toEqual({
			listings: [],
		})
	})

	// The account page shows what the public listing does not: moderation state,
	// views and contacts.
	it('carries the owner-only fields the public mapper drops', async () => {
		getMyLostItems.mockResolvedValue([dto()])

		const { listings } = await accountPostsLoader({ request: request() })

		expect(listings[0]).toMatchObject({
			id: 'post-1',
			status: 'active',
			moderationStatus: 'published',
			views: 12,
			contacts: 3,
		})
	})

	it('maps every listing the API returns', async () => {
		getMyLostItems.mockResolvedValue([
			dto(),
			dto({ id: 'post-2', moderationStatus: 'pending' }),
		])

		const { listings } = await accountPostsLoader({ request: request() })

		expect(listings.map(l => l.id)).toEqual(['post-1', 'post-2'])
		expect(listings[1]?.moderationStatus).toBe('pending')
	})
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
