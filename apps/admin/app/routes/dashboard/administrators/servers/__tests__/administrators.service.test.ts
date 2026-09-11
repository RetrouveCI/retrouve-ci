import { banAdminUser, listAdminUsers } from '../administrators.service'

function mockFetch(body = '{"users":[],"total":0}') {
	const spy = vi.fn().mockResolvedValue(new Response(body, { status: 200 }))
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
	// ⚠️ An offset over an arbitrary order lets page 2 repeat page 1.
	it('asks the database for the newest administrators first', async () => {
		const spy = mockFetch()

		await listAdminUsers({}, incoming())

		const query = new URL(String(spy.mock.calls[0]?.[0])).searchParams

		expect(query.get('sortBy')).toBe('createdAt')
		expect(query.get('sortDirection')).toBe('desc')
	})

	it('asks for one page, at the offset the page number names', async () => {
		const spy = mockFetch()

		await listAdminUsers({ page: 2, pageSize: 10 }, incoming())

		const query = new URL(String(spy.mock.calls[0]?.[0])).searchParams

		expect(query.get('limit')).toBe('10')
		expect(query.get('offset')).toBe('10')
	})

	it('counts through the database rather than over the page', async () => {
		mockFetch('{"users":[],"total":42}')

		await expect(listAdminUsers({}, incoming())).resolves.toMatchObject({
			total: 42,
		})
	})

	// Everything that is not a visitor: the single filter is spent on the role.
	it('keeps narrowing the list away from ordinary accounts', async () => {
		const spy = mockFetch()

		await listAdminUsers({}, incoming())

		const query = new URL(String(spy.mock.calls[0]?.[0])).searchParams

		expect(query.get('filterField')).toBe('role')
		expect(query.get('filterOperator')).toBe('ne')
		expect(query.get('filterValue')).toBe('user')
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
		await listAdminUsers({}, incoming())
		expect(headersOf(read).Origin).toBeUndefined()
		expect(headersOf(read)['X-Auth-Audience']).toBe('admin')
	})
})
