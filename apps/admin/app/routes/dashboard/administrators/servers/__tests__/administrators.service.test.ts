import { banAdminUser, listAdminUsers } from '../administrators.service'

function mockFetch() {
	const spy = vi
		.fn()
		.mockResolvedValue(new Response('{"users":[]}', { status: 200 }))
	vi.stubGlobal('fetch', spy)
	return spy
}

const headersOf = (spy: ReturnType<typeof mockFetch>) =>
	spy.mock.calls[0]?.[1]?.headers as Record<string, string>

const incoming = () =>
	new Request('http://localhost:3001/administrators', {
		headers: {
			cookie: 'retrouveci-admin.session_token=abc',
			'x-forwarded-for': '41.66.1.1',
		},
	})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the administrators service', () => {
	// Same ceiling as the users list, and the same arbitrary cut without a sort.
	it('asks the database for the newest administrators first', async () => {
		const spy = mockFetch()

		await listAdminUsers(incoming())

		const query = new URL(String(spy.mock.calls[0]?.[0])).searchParams

		expect(query.get('sortBy')).toBe('createdAt')
		expect(query.get('sortDirection')).toBe('desc')
	})

	// The bug R50 closes: every backoffice mutation keyed on this container, so
	// one `auth` bucket of ten per fifteen minutes served the whole office.
	it('sends the caller address and the cookie on a mutation', async () => {
		const spy = mockFetch()

		await banAdminUser(incoming(), 'adm-1')

		expect(headersOf(spy)['X-Client-Ip']).toBe('41.66.1.1')
		expect(headersOf(spy).Cookie).toBe('retrouveci-admin.session_token=abc')
	})

	// `Origin` wins over `X-Auth-Audience`, so sending one decides which
	// better-auth instance answers. R50 forwards the request without moving that
	// line: mutations named one already, the list read never did.
	it('names an origin on a mutation and none on the list read', async () => {
		const mutation = mockFetch()
		await banAdminUser(incoming(), 'adm-1')
		expect(headersOf(mutation).Origin).toBe('http://localhost:3001')

		vi.unstubAllGlobals()

		const read = mockFetch()
		await listAdminUsers(incoming())
		expect(headersOf(read).Origin).toBeUndefined()
		expect(headersOf(read)['X-Auth-Audience']).toBe('admin')
	})
})
