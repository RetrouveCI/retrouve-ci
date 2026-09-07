import { getUserById, listUsers } from '../users.service'

function mockFetch(body = '{"users":[],"total":0}') {
	const spy = vi.fn().mockResolvedValue(new Response(body, { status: 200 }))
	vi.stubGlobal('fetch', spy)
	return spy
}

const urlOf = (spy: ReturnType<typeof mockFetch>) =>
	new URL(String(spy.mock.calls[0]?.[0]))

const incoming = () =>
	new Request('http://localhost:3001/users', {
		headers: { cookie: 'retrouveci-admin.session_token=abc' },
	})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the users service', () => {
	// Unsorted, the ceiling cut an arbitrary 500: the newest sign-ups could be
	// the ones missing, so the sort has to happen before that cut.
	it('asks the database for the newest accounts first', async () => {
		const spy = mockFetch()

		await listUsers(incoming())

		const query = urlOf(spy).searchParams

		expect(query.get('sortBy')).toBe('createdAt')
		expect(query.get('sortDirection')).toBe('desc')
		expect(query.get('limit')).toBe('500')
	})

	it('keeps narrowing the list to ordinary accounts', async () => {
		const spy = mockFetch()

		await listUsers(incoming())

		const query = urlOf(spy).searchParams

		expect(query.get('filterField')).toBe('role')
		expect(query.get('filterValue')).toBe('user')
	})

	// One row by id: a sort would decide nothing and the filter is the point.
	it('reads a single account by id, unsorted', async () => {
		const spy = mockFetch()

		await getUserById(incoming(), 'user-1')

		const query = urlOf(spy).searchParams

		expect(query.get('filterValue')).toBe('user-1')
		expect(query.get('sortBy')).toBeNull()
	})
})
