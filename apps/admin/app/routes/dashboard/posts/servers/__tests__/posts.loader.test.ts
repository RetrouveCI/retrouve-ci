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

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listPosts.mockReset().mockResolvedValue({ items: [], total: 0 })
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

	it.each(MODERATION_STATUSES)(
		'forwards the %s moderation filter',
		async moderationStatus => {
			const result = await postsLoader({
				request: requestFor(`?status=${moderationStatus}`),
			})

			expect(listPosts).toHaveBeenCalledWith(
				{ moderationStatus, type: undefined },
				expect.any(Request),
			)
			expect(result.statusFilter).toBe(moderationStatus)
		},
	)

	it.each(LOST_ITEM_TYPES)('forwards the %s type filter', async type => {
		const result = await postsLoader({ request: requestFor(`?type=${type}`) })

		expect(listPosts).toHaveBeenCalledWith(
			{ moderationStatus: undefined, type },
			expect.any(Request),
		)
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

		expect(listPosts).toHaveBeenCalledWith(
			{ moderationStatus: undefined, type: undefined },
			expect.any(Request),
		)
	})

	it('combines both filters', async () => {
		await postsLoader({ request: requestFor('?status=hidden&type=found') })

		expect(listPosts).toHaveBeenCalledWith(
			{ moderationStatus: 'hidden', type: 'found' },
			expect.any(Request),
		)
	})

	it('reports no filter as all', async () => {
		const result = await postsLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
		expect(result.typeFilter).toBe('all')
	})

	it('returns the posts and the total the service reports', async () => {
		listPosts.mockResolvedValue({ items: [{ id: 'post-1' }], total: 1 })

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
		listPosts.mockResolvedValue({ items: [{ id: 'post-1' }], total: 1 })
		listUnreadThreads.mockRejectedValue(new Error('unreachable'))

		const result = await postsLoader({ request: requestFor() })

		expect(result.posts).toEqual([{ id: 'post-1' }])
		expect(result.unreadReplies).toEqual({})
	})
})
