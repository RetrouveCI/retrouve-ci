import { LOST_ITEM_TYPES, MODERATION_STATUSES } from '@app/contracts/lost-items'

const { requireAdminSession, listPosts, listUnreadThreads } = vi.hoisted(
	() => ({
		requireAdminSession: vi.fn(),
		listPosts: vi.fn(),
		listUnreadThreads: vi.fn(),
	}),
)

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../posts.service', () => ({ listPosts, listUnreadThreads }))

const { postsLoader } = await import('../posts.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/posts${search}`)

const answer = (items: unknown[], total = items.length) => ({
	items,
	total,
	page: 1,
	pageSize: 25,
})

/** The page the loader asked for, told apart from its one-row count probes. */
const pageCall = () =>
	listPosts.mock.calls.find(([params]) => params.pageSize !== 1)?.[0]

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listPosts.mockReset().mockResolvedValue(answer([]))
	listUnreadThreads.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('postsLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await postsLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(postsLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(listPosts).not.toHaveBeenCalled()
		expect(listUnreadThreads).not.toHaveBeenCalled()
	})

	// The list used to arrive whole and be paged in the browser, so what lay
	// past a hard-coded ceiling did not exist for the operator.
	it('asks the API for the first page by default', async () => {
		await postsLoader({ request: requestFor() })

		expect(pageCall()).toEqual({
			moderationStatus: undefined,
			type: undefined,
			search: undefined,
			page: 1,
			pageSize: 25,
		})
	})

	it('forwards the page, the size and the search the URL carries', async () => {
		listPosts.mockResolvedValue(answer([], 500))

		await postsLoader({
			request: requestFor('?page=3&pageSize=50&q=%20carte%20'),
		})

		expect(pageCall()).toMatchObject({
			search: 'carte',
			page: 3,
			pageSize: 50,
		})
	})

	it.each(MODERATION_STATUSES)(
		'forwards the %s moderation filter',
		async moderationStatus => {
			const result = await postsLoader({
				request: requestFor(`?status=${moderationStatus}`),
			})

			expect(pageCall()).toMatchObject({ moderationStatus })
			expect(result.statusFilter).toBe(moderationStatus)
		},
	)

	it.each(LOST_ITEM_TYPES)('forwards the %s type filter', async type => {
		const result = await postsLoader({ request: requestFor(`?type=${type}`) })

		expect(pageCall()).toMatchObject({ type })
		expect(result.typeFilter).toBe(type)
	})

	it.each([
		'?status=valide',
		'?status=PENDING',
		'?status=',
		'?type=stolen',
		'?type=LOST',
	])('drops what the contract refuses in %s', async search => {
		await postsLoader({ request: requestFor(search) })

		expect(pageCall()).toMatchObject({
			moderationStatus: undefined,
			type: undefined,
		})
	})

	it('combines both filters', async () => {
		await postsLoader({ request: requestFor('?status=hidden&type=found') })

		expect(pageCall()).toMatchObject({
			moderationStatus: 'hidden',
			type: 'found',
		})
	})

	// Over every row the other axes match: the chips and the grid add up to the
	// total, which they did not when they were counted on the page.
	it('counts each status through the API, with the type and the search applied', async () => {
		listPosts.mockImplementation(async ({ moderationStatus, pageSize }) =>
			answer([], pageSize === 1 && moderationStatus ? 2 : 10),
		)

		const result = await postsLoader({
			request: requestFor('?type=lost&q=carte'),
		})

		expect(result.counts).toEqual({
			all: 10,
			...Object.fromEntries(MODERATION_STATUSES.map(status => [status, 2])),
		})
		for (const moderationStatus of MODERATION_STATUSES) {
			expect(listPosts).toHaveBeenCalledWith(
				{
					moderationStatus,
					type: 'lost',
					search: 'carte',
					page: 1,
					pageSize: 1,
				},
				expect.any(Request),
			)
		}
	})

	it('reads the counters as absent when one cannot be served', async () => {
		listPosts.mockImplementation(async ({ moderationStatus, pageSize }) => {
			if (pageSize === 1 && moderationStatus === MODERATION_STATUSES[0])
				throw new Error('down')
			return answer([], 3)
		})

		const result = await postsLoader({ request: requestFor() })

		expect(result.counts).toBeNull()
		expect(result.total).toBe(3)
	})

	it('sends a page past the end back to the last one', async () => {
		listPosts.mockResolvedValue(answer([], 30))

		const thrown = await postsLoader({
			request: requestFor('?status=pending&page=9'),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe(
			'/posts?status=pending&page=2',
		)
	})

	it('reports no filter as all', async () => {
		const result = await postsLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
		expect(result.typeFilter).toBe('all')
	})

	it('returns the posts and the total the service reports', async () => {
		listPosts.mockResolvedValue(answer([{ id: 'post-1' }], 1))

		const result = await postsLoader({ request: requestFor() })

		expect(result.posts).toEqual([{ id: 'post-1' }])
		expect(result.total).toBe(1)
	})

	it('marks the listings holding an unread reply', async () => {
		listUnreadThreads.mockResolvedValue([{ lostItemId: 'post-1', unread: 2 }])

		const result = await postsLoader({ request: requestFor() })

		expect(result.unreadReplies).toEqual({ 'post-1': 2 })
	})

	// A marker is a hint: the list the desk works from must still arrive.
	it('still answers the list when the unread replies cannot be read', async () => {
		listPosts.mockResolvedValue(answer([{ id: 'post-1' }], 1))
		listUnreadThreads.mockRejectedValue(new Error('unreachable'))

		const result = await postsLoader({ request: requestFor() })

		expect(result.posts).toEqual([{ id: 'post-1' }])
		expect(result.unreadReplies).toEqual({})
	})
})
