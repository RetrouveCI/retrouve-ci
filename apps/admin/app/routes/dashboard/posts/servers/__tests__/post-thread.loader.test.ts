import type { PostComment } from '../../types/posts.types'

const { requireAdminSession, getPostThread } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getPostThread: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../posts.service', () => ({ getPostThread }))

const { loader } = await import('../post-thread.loader')
const { ApiError } = await import('@/shared/utils/api-fetch')

const request = new Request('http://localhost:3001/posts/post-1/comments')
const params = { id: 'post-1' }

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getPostThread.mockReset().mockResolvedValue([])
})

describe('the post thread loader', () => {
	it('does not read the thread when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(loader({ request, params })).rejects.toBe(redirect)
		expect(getPostThread).not.toHaveBeenCalled()
	})

	it('answers the thread of the listing in the path, naming it', async () => {
		const comments: Partial<PostComment>[] = [{ id: 'comment-1' }]
		getPostThread.mockResolvedValue(comments)

		await expect(loader({ request, params })).resolves.toEqual({
			postId: 'post-1',
			comments,
		})
		expect(getPostThread).toHaveBeenCalledWith('post-1', request)
	})

	// Answering `[]` would read as « no comment yet ».
	it('says so when the API refuses, rather than answering an empty thread', async () => {
		getPostThread.mockRejectedValue(new ApiError(404, 'Annonce introuvable'))

		await expect(loader({ request, params })).resolves.toEqual({
			postId: 'post-1',
			comments: null,
		})
	})

	it('lets a non-API failure through', async () => {
		getPostThread.mockRejectedValue(new Error('boom'))

		await expect(loader({ request, params })).rejects.toThrow('boom')
	})
})
