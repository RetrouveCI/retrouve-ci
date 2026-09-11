const { requireAdminSession, getPost } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getPost: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/posts.service', () => ({ getPost }))

const { postLoader } = await import('../post.loader')

const request = new Request('http://localhost:3001/posts/post-1')
const params = { id: 'post-1' }

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getPost.mockReset().mockResolvedValue({ id: 'post-1' })
})

describe('postLoader', () => {
	it('does not read the listing when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(postLoader({ request, params })).rejects.toBe(redirect)
		expect(getPost).not.toHaveBeenCalled()
	})

	it('reads the listing in the path, forwarding the session', async () => {
		await expect(postLoader({ request, params })).resolves.toEqual({
			post: { id: 'post-1' },
		})
		expect(getPost).toHaveBeenCalledWith('post-1', request)
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
