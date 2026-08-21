import { apiFetch } from '@/shared/utils/api-fetch'
import { requireAdminSession } from '../session.server'

vi.mock('@/shared/utils/api-fetch', () => ({ apiFetch: vi.fn() }))

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
