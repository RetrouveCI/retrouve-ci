const { requireServerSession, getMyLostItemsPage, getMyLostItemsSummary } =
	vi.hoisted(() => ({
		requireServerSession: vi.fn(),
		getMyLostItemsPage: vi.fn(),
		getMyLostItemsSummary: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../account-posts.service', () => ({
	getMyLostItemsPage,
	getMyLostItemsSummary,
}))

const { accountPostsLoader } = await import('../account-posts.loader')

const request = (query = '') =>
	new Request(`http://localhost:3000/account/posts${query}`)

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

const summary = (overrides: Record<string, unknown> = {}) => ({
	total: 6,
	lifecycle: { active: 3, resolved: 2, expired: 1 },
	moderation: { pending: 1, published: 4, hidden: 1 },
	...overrides,
})

const EMPTY_SUMMARY = {
	total: 0,
	lifecycle: { active: 0, resolved: 0, expired: 0 },
	moderation: { pending: 0, published: 0, hidden: 0 },
}

const page = (items: unknown[], total = items.length, current = 1) => ({
	items,
	total,
	page: current,
	pageSize: 12,
})

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getMyLostItemsPage.mockReset().mockResolvedValue(page([]))
	getMyLostItemsSummary.mockReset().mockResolvedValue(summary())
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
		expect(getMyLostItemsPage).not.toHaveBeenCalled()
		expect(getMyLostItemsSummary).not.toHaveBeenCalled()
	})

	it('reports an empty account as no listing', async () => {
		getMyLostItemsSummary.mockResolvedValue(summary(EMPTY_SUMMARY))

		expect(await accountPostsLoader({ request: request() })).toEqual({
			listings: [],
			total: 0,
			page: 1,
			pageSize: 12,
			summary: EMPTY_SUMMARY,
		})
	})

	/**
	 * The counters the pills and the banner read come from the API, over every
	 * listing the visitor owns — not from the twelve the page happens to hold.
	 */
	it('carries the owner-wide counts alongside the page', async () => {
		const result = await accountPostsLoader({
			request: request('?status=active'),
		})

		expect(getMyLostItemsSummary).toHaveBeenCalledWith(expect.any(Request))
		expect(result.summary).toEqual(summary())
	})

	// A badge must never take the screen down: the list is the page, the counts
	// are decoration on it.
	it('reads the counters as zero when the API cannot serve them', async () => {
		getMyLostItemsSummary.mockRejectedValue(new Error('down'))
		getMyLostItemsPage.mockResolvedValue(page([dto()]))

		const result = await accountPostsLoader({ request: request() })

		expect(result.summary).toEqual(EMPTY_SUMMARY)
		expect(result.listings).toHaveLength(1)
	})

	// The account page shows what the public listing does not: moderation state,
	// views and contacts.
	it('carries the owner-only fields the public mapper drops', async () => {
		getMyLostItemsPage.mockResolvedValue(page([dto()]))

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
		getMyLostItemsPage.mockResolvedValue(
			page([dto(), dto({ id: 'post-2', moderationStatus: 'pending' })]),
		)

		const { listings } = await accountPostsLoader({ request: request() })

		expect(listings.map(l => l.id)).toEqual(['post-1', 'post-2'])
		expect(listings[1]?.moderationStatus).toBe('pending')
	})

	// The whole point of R11: the API filters and paginates, the browser does not.
	it('hands the API the filters the URL carries', async () => {
		getMyLostItemsPage.mockResolvedValue(page([dto()], 40, 3))

		await accountPostsLoader({
			request: request('?q=sac&status=resolved&page=3'),
		})

		expect(getMyLostItemsPage).toHaveBeenCalledWith(expect.any(Request), {
			search: 'sac',
			resolutionStatus: 'resolved',
			page: 3,
			pageSize: 12,
		})
	})

	it('drops a filter the contract refuses and keeps the rest', async () => {
		await accountPostsLoader({ request: request('?status=archivee&q=clés') })

		expect(getMyLostItemsPage).toHaveBeenCalledWith(expect.any(Request), {
			search: 'clés',
			page: 1,
			pageSize: 12,
		})
	})

	it('reports the page the API answered with', async () => {
		getMyLostItemsPage.mockResolvedValue(page([dto()], 30, 2))

		const result = await accountPostsLoader({ request: request('?page=2') })

		expect(result).toMatchObject({ total: 30, page: 2, pageSize: 12 })
	})

	/**
	 * Deleting the last listing of the last page leaves `page` pointing past the
	 * list. The address is the state, so the address is what gets corrected.
	 */
	it('redirects to the last page when the URL points past the list', async () => {
		getMyLostItemsPage.mockResolvedValue(page([], 24, 5))

		const thrown = await accountPostsLoader({
			request: request('?page=5&q=sac'),
		}).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).headers.get('location')).toBe(
			'/account/posts?page=2&q=sac',
		)
	})

	it('drops the page param entirely when the list fits on one page', async () => {
		getMyLostItemsPage.mockResolvedValue(page([], 3, 4))

		const thrown = await accountPostsLoader({
			request: request('?page=4'),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe('/account/posts')
	})

	it('leaves an empty first page alone', async () => {
		getMyLostItemsPage.mockResolvedValue(page([], 0, 1))

		await expect(
			accountPostsLoader({ request: request('?status=expired') }),
		).resolves.toMatchObject({ listings: [] })
	})
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
