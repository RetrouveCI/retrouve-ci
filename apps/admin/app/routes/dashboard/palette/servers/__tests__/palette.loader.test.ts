const { requireAdminSession, searchPalette } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	searchPalette: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../palette.service', () => ({ searchPalette }))

const { loader } = await import('../palette.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/palette${search}`)

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	searchPalette.mockReset().mockResolvedValue([])
})

describe('the palette loader', () => {
	it('does not search when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(loader({ request: requestFor('?q=RCI') })).rejects.toBe(
			redirect,
		)
		expect(searchPalette).not.toHaveBeenCalled()
	})

	// A single letter would match half the base, four times over.
	it('answers nothing below two characters, asking nobody', async () => {
		await expect(loader({ request: requestFor('?q=a') })).resolves.toEqual({
			query: 'a',
			hits: [],
		})
		expect(searchPalette).not.toHaveBeenCalled()
	})

	// The hook drops an answer whose query is not the one being typed.
	it('searches the trimmed query and names it in the answer', async () => {
		const hits = [{ kind: 'sticker', id: 'RCI-7K2M4P' }]
		searchPalette.mockResolvedValue(hits)
		const request = requestFor('?q=%20RCI-7K%20')

		await expect(loader({ request })).resolves.toEqual({
			query: 'RCI-7K',
			hits,
		})
		expect(searchPalette).toHaveBeenCalledWith('RCI-7K', request)
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
