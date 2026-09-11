import { getUserById, listUsers, searchUsers } from '../users.service'

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
	// ⚠️ Not decoration: an offset over an arbitrary order lets page 2 repeat
	// page 1, so the sort has to be asked for alongside the window.
	it('asks the database for the newest accounts first', async () => {
		const spy = mockFetch()

		await listUsers({}, incoming())

		const query = urlOf(spy).searchParams

		expect(query.get('sortBy')).toBe('createdAt')
		expect(query.get('sortDirection')).toBe('desc')
	})

	// It used to ask for 500 and page them in the browser, so a 501st account
	// did not exist for the operator.
	it('asks for one page, at the offset the page number names', async () => {
		const spy = mockFetch()

		await listUsers({ page: 3, pageSize: 50 }, incoming())

		const query = urlOf(spy).searchParams

		expect(query.get('limit')).toBe('50')
		expect(query.get('offset')).toBe('100')
	})

	it('counts through the database rather than over the page', async () => {
		mockFetch('{"users":[],"total":1284}')

		await expect(listUsers({}, incoming())).resolves.toMatchObject({
			total: 1284,
		})
	})

	it('sends the search the same way the palette does', async () => {
		const spy = mockFetch()

		await listUsers({ search: '07 12 66' }, incoming())

		const query = urlOf(spy).searchParams

		expect(query.get('searchField')).toBe('email')
		expect(query.get('searchValue')).toBe('071266')
	})

	it('asks for no search when none was typed', async () => {
		const spy = mockFetch()

		await listUsers({}, incoming())

		expect(urlOf(spy).searchParams.get('searchValue')).toBeNull()
	})

	it('keeps narrowing the list to ordinary accounts', async () => {
		const spy = mockFetch()

		await listUsers({}, incoming())

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

	// A visitor signs up with a number, stored as the e-mail's local part.
	it('searches a number through the e-mail it is stored under', async () => {
		const spy = mockFetch()

		await searchUsers(incoming(), '07 12 66', 5)

		const query = urlOf(spy).searchParams

		expect(query.get('searchField')).toBe('email')
		expect(query.get('searchValue')).toBe('071266')
		expect(query.get('limit')).toBe('5')
		expect(query.get('filterValue')).toBe('user')
	})

	it('searches a name through the name field', async () => {
		const spy = mockFetch()

		await searchUsers(incoming(), 'Konan', 5)

		const query = urlOf(spy).searchParams

		expect(query.get('searchField')).toBe('name')
		expect(query.get('searchValue')).toBe('Konan')
	})
})
