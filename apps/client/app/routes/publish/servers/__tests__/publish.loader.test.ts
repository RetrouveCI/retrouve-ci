const { requireServerSession, getMyStickers } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getMyStickers: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../../../account/stickers/servers/stickers.service', () => ({
	getMyStickers,
}))

const { publishLoader } = await import('../publish.loader')

const request = () => new Request('http://localhost:3000/publish/lost')
const load = (type: 'lost' | 'found' = 'lost', req = request()) =>
	publishLoader({ request: req, type })

const sticker = (over: Record<string, unknown> = {}) => ({
	code: 'RCI-ABC123',
	status: 'activated',
	label: 'Clés de la maison',
	...over,
})

beforeEach(() => {
	requireServerSession
		.mockReset()
		.mockResolvedValue({ user: { id: 'u1', name: 'Konan' } })
	getMyStickers.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('publishLoader', () => {
	// The page holds a long form; the gate belongs here rather than on submit.
	it('gates on the session', async () => {
		const req = request()

		await load('lost', req)

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('propagates the redirect an anonymous visitor gets', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(load()).rejects.toBe(redirect)
	})

	it('offers the account name as the contact name', async () => {
		expect(await load()).toEqual({ contactName: 'Konan', stickers: [] })
	})

	// An account that never named itself carries its own number, which is not a
	// name to offer the finder.
	it('offers nothing when the account is named after its number', async () => {
		requireServerSession.mockResolvedValue({
			user: { id: 'u1', name: '+2250700000000' },
		})

		expect(await load()).toEqual({ contactName: '', stickers: [] })
	})
})

/** A9: only a sticker a finder could actually scan may be offered. */
describe('publishLoader — the stickers a listing may name', () => {
	it('offers the activated ones, named by their label', async () => {
		getMyStickers.mockResolvedValue([sticker()])

		expect((await load()).stickers).toEqual([
			{ code: 'RCI-ABC123', label: 'Clés de la maison' },
		])
	})

	it('falls back to the code when the sticker was never named', async () => {
		getMyStickers.mockResolvedValue([sticker({ label: null })])

		expect((await load()).stickers[0]?.label).toBe('RCI-ABC123')
	})

	it.each(['generated', 'revoked'])('leaves a %s sticker out', async status => {
		getMyStickers.mockResolvedValue([sticker({ status })])

		expect((await load()).stickers).toEqual([])
	})

	// None of your stickers is on an object you just found.
	it('asks for nothing at all on a found listing', async () => {
		expect((await load('found')).stickers).toEqual([])
		expect(getMyStickers).not.toHaveBeenCalled()
	})

	// An accessory field must not take the whole publication form down.
	it('offers none rather than failing when the read breaks', async () => {
		getMyStickers.mockRejectedValue(new Error('api down'))

		expect((await load()).stickers).toEqual([])
	})
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
