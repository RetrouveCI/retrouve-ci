import { apiFetch } from '@/shared/utils/api-fetch'
import {
	getServerSession,
	redirectIfAuthenticated,
	requireServerSession,
} from '../session.server'

vi.mock('@/shared/utils/api-fetch', () => ({ apiFetch: vi.fn() }))

const mockedApiFetch = vi.mocked(apiFetch)

function sessionFor(role: string) {
	return {
		session: { id: 'sess-1', userId: 'user-1', role },
		user: {
			id: 'user-1',
			name: 'Awa Koné',
			email: 'awa@example.ci',
			role,
			phoneNumber: '+2250700000000',
			phoneNumberVerified: true,
			city: 'Abidjan',
			commune: 'Cocody',
			createdAt: '2026-01-01T00:00:00.000Z',
		},
	}
}

const request = new Request('https://retrouve.ci/account/posts')

describe('getServerSession', () => {
	beforeEach(() => {
		mockedApiFetch.mockReset()
	})

	it('returns the session of a regular user', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('user'))

		const session = await getServerSession(request)

		expect(session?.user.id).toBe('user-1')
	})

	it('accepts a backoffice account: an admin is a user of this app too', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('admin'))

		const session = await getServerSession(request)

		expect(session?.user.id).toBe('user-1')
	})

	it('reports no session when the API has none', async () => {
		mockedApiFetch.mockResolvedValue(null)

		expect(await getServerSession(request)).toBeNull()
	})

	it('reports no session when the API call fails', async () => {
		mockedApiFetch.mockRejectedValue(new Error('network down'))

		expect(await getServerSession(request)).toBeNull()
	})
})

describe('requireServerSession', () => {
	beforeEach(() => {
		mockedApiFetch.mockReset()
	})

	it('returns the session of a regular user', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('user'))

		const session = await requireServerSession(request)

		expect(session.user.id).toBe('user-1')
	})

	it('lets a backoffice account through', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('admin'))

		await expect(requireServerSession(request)).resolves.toMatchObject({
			user: { role: 'admin' },
		})
	})

	it('redirects to the login page, remembering the page, when there is no session', async () => {
		mockedApiFetch.mockResolvedValue(null)

		const thrown = await requireServerSession(request).catch(
			(error: unknown) => error,
		)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).headers.get('Location')).toBe(
			'/auth/login?redirectTo=%2Faccount%2Fposts',
		)
	})
})

describe('redirectIfAuthenticated', () => {
	beforeEach(() => {
		mockedApiFetch.mockReset()
	})

	it('sends a signed-in admin away from the auth pages, like any other user', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('admin'))

		const thrown = await redirectIfAuthenticated(
			new Request('https://retrouve.ci/auth/login'),
		).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
	})

	it('lets an anonymous visitor reach the auth pages', async () => {
		mockedApiFetch.mockResolvedValue(null)

		await expect(
			redirectIfAuthenticated(new Request('https://retrouve.ci/auth/login')),
		).resolves.toBeUndefined()
	})

	it('sends an already signed-in user away from the auth pages', async () => {
		mockedApiFetch.mockResolvedValue(sessionFor('user'))

		const thrown = await redirectIfAuthenticated(
			new Request('https://retrouve.ci/auth/login?redirectTo=%2Fpublish'),
		).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).headers.get('Location')).toBe('/publish')
	})
})
