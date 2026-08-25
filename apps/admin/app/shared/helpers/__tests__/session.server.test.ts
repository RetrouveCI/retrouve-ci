import { ApiError, apiFetch } from '@/shared/utils/api-fetch'
import { getServerSession, requireAdminSession } from '../session.server'

// Only `apiFetch` is faked: the helper narrows on the real `ApiError`.
vi.mock('@/shared/utils/api-fetch', async importOriginal => ({
	...(await importOriginal<typeof import('@/shared/utils/api-fetch')>()),
	apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

const sessionFor = (role: string) => ({
	session: { id: 'sess-1', userId: 'user-1' },
	user: { id: 'user-1', name: 'Awa Koné', email: 'awa@retrouve.ci', role },
})

const locationOf = async (url: string) => {
	const thrown = await requireAdminSession(new Request(url)).catch(
		(error: unknown) => error,
	)
	expect(thrown).toBeInstanceOf(Response)
	return (thrown as Response).headers.get('Location')
}

beforeEach(() => {
	mockedApiFetch.mockReset()
})

describe('requireAdminSession', () => {
	it('returns the session of an admin', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('admin'))

		await expect(
			requireAdminSession(new Request('https://bo.retrouve.ci/orders')),
		).resolves.toMatchObject({ user: { role: 'admin' } })
	})

	it('refuses a non-admin, even signed in', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('user'))

		expect(await locationOf('https://bo.retrouve.ci/orders')).toBe(
			'/auth/login?redirectTo=%2Forders',
		)
	})

	// The bug this replaces: a single-fetch loader request carries
	// `/orders.data?_routes=…`, and remembering *that* sent the admin back to a
	// raw turbo-stream payload after signing in.
	it('remembers the route path, not the single-fetch data URL', async () => {
		mockedApiFetch.mockResolvedValue(null)

		expect(
			await locationOf(
				'https://bo.retrouve.ci/orders.data?_routes=routes%2Fdashboard%2Forders%2F_index',
			),
		).toBe('/auth/login?redirectTo=%2Forders')
	})

	it('drops only the internal param from a real query string', async () => {
		mockedApiFetch.mockResolvedValue(null)

		expect(
			await locationOf(
				'https://bo.retrouve.ci/orders.data?_routes=x&status=pending',
			),
		).toBe('/auth/login?redirectTo=%2Forders%3Fstatus%3Dpending')
	})
})

describe('getServerSession', () => {
	it('reports no session when the API says so', async () => {
		mockedApiFetch.mockResolvedValue(null)

		await expect(
			getServerSession(new Request('https://bo.retrouve.ci/')),
		).resolves.toBeNull()
	})

	it('treats a 401 as signed out', async () => {
		mockedApiFetch.mockRejectedValue(new ApiError(401, 'unauthorized'))

		await expect(
			getServerSession(new Request('https://bo.retrouve.ci/')),
		).resolves.toBeNull()
	})

	/**
	 * An unreachable API used to look exactly like a signed-out user, which is
	 * how a broken deployment became a silent login loop.
	 */
	it('surfaces a failed check instead of reporting signed out', async () => {
		mockedApiFetch.mockRejectedValue(new Error('fetch failed'))

		await expect(
			getServerSession(new Request('https://bo.retrouve.ci/')),
		).rejects.toThrow('fetch failed')
	})

	it('surfaces a 500 too', async () => {
		mockedApiFetch.mockRejectedValue(new ApiError(500, 'boom'))

		await expect(
			getServerSession(new Request('https://bo.retrouve.ci/')),
		).rejects.toThrow()
	})
})
