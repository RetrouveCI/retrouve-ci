const { requireServerSession } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))

const { publishLoader } = await import('../publish.loader')

const request = () => new Request('http://localhost:3000/publish/lost')

beforeEach(() => {
	requireServerSession
		.mockReset()
		.mockResolvedValue({ user: { id: 'u1', name: 'Konan' } })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('publishLoader', () => {
	// The page holds a long form; the gate belongs here rather than on submit.
	it('gates on the session', async () => {
		const req = request()

		await publishLoader({ request: req })

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('propagates the redirect an anonymous visitor gets', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(publishLoader({ request: request() })).rejects.toBe(redirect)
	})

	it('offers the account name as the contact name', async () => {
		expect(await publishLoader({ request: request() })).toEqual({
			contactName: 'Konan',
		})
	})

	// An account that never named itself carries its own number, which is not a
	// name to offer the finder.
	it('offers nothing when the account is named after its number', async () => {
		requireServerSession.mockResolvedValue({
			user: { id: 'u1', name: '+2250700000000' },
		})

		expect(await publishLoader({ request: request() })).toEqual({
			contactName: '',
		})
	})
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
