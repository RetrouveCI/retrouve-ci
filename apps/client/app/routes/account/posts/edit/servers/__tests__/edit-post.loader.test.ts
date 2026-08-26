const { requireServerSession, getMyLostItems } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getMyLostItems: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../../../servers/account-posts.service', () => ({ getMyLostItems }))

const { editPostLoader } = await import('../edit-post.loader')

const request = () => new Request('http://localhost:3000/account/posts/post-1')

const dto = (id: string, moderationStatus = 'pending') => ({
	id,
	moderationStatus,
	title: 'Sac à dos noir',
})

const redirectTo = (value: unknown) =>
	value instanceof Response ? value.headers.get('location') : null

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getMyLostItems.mockReset().mockResolvedValue([dto('post-1')])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('editPostLoader', () => {
	it('gates on the session before reading anything', async () => {
		const req = request()

		await editPostLoader(req, 'post-1')

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('hands the form the listing being edited', async () => {
		const { item } = await editPostLoader(request(), 'post-1')

		expect(item).toMatchObject({ id: 'post-1' })
	})

	// The list is the caller's own, so an id missing from it is either someone
	// else's listing or a deleted one — same answer either way.
	it('sends an unknown id back to the list', async () => {
		const thrown = await editPostLoader(request(), 'post-404').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/account/posts')
	})

	it("sends someone else's listing back to the list", async () => {
		getMyLostItems.mockResolvedValue([dto('post-2')])

		const thrown = await editPostLoader(request(), 'post-1').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/account/posts')
	})

	// Editing is only open while moderation has not passed yet.
	it.each(['published', 'hidden'])(
		'sends a %s listing to its public page instead',
		async moderationStatus => {
			getMyLostItems.mockResolvedValue([dto('post-1', moderationStatus)])

			const thrown = await editPostLoader(request(), 'post-1').catch(
				(error: unknown) => error,
			)

			expect(redirectTo(thrown)).toBe('/posts/post-1')
		},
	)
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
