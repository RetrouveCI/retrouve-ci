import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { AuthProvider, useAuth } from '../auth'

const { signOut, useSession, navigate } = vi.hoisted(() => ({
	signOut: vi.fn(),
	useSession: vi.fn(),
	navigate: vi.fn(),
}))

vi.mock('@/shared/helpers/auth-client', () => ({
	authClient: { signOut, useSession, signIn: { phoneNumber: vi.fn() } },
}))

vi.mock('react-router', async importOriginal => ({
	...(await importOriginal<typeof import('react-router')>()),
	useNavigate: () => navigate,
}))

const SESSION = {
	data: {
		user: {
			id: 'user-1',
			name: 'Awa',
			email: 'awa@example.com',
			phoneNumber: '+2250700000000',
			createdAt: '2026-08-01T10:00:00.000Z',
		},
	},
	isPending: false,
}

function LogoutButton() {
	const { logout, isAuthenticated } = useAuth()

	return (
		<button type="button" onClick={() => void logout()}>
			{isAuthenticated ? 'Se déconnecter' : 'Déconnecté'}
		</button>
	)
}

function renderProvider() {
	const Stub = createRoutesStub([
		{
			path: '/account',
			Component: () => (
				<AuthProvider>
					<LogoutButton />
				</AuthProvider>
			),
		},
	])
	render(<Stub initialEntries={['/account']} />)
}

const button = () => page.getByRole('button', { name: 'Se déconnecter' })

beforeEach(() => {
	signOut.mockReset().mockResolvedValue(undefined)
	useSession.mockReset().mockReturnValue(SESSION)
	navigate.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('signing out', () => {
	it('lands on the sign-in screen, replacing the account page', async () => {
		renderProvider()
		await userEvent.click(button())

		await vi.waitFor(() =>
			expect(navigate).toHaveBeenCalledWith('/login', { replace: true }),
		)
	})

	// R47's bug: `/login` bounces a visitor who still holds a session, and it
	// bounces them to `/account` — `sanitizeRedirect(null)` being the default.
	it('waits for the session to be dropped before navigating', async () => {
		let drop = () => {}
		signOut.mockReturnValue(
			new Promise<void>(resolve => {
				drop = () => resolve()
			}),
		)

		renderProvider()
		await userEvent.click(button())

		await vi.waitFor(() => expect(signOut).toHaveBeenCalled())
		expect(navigate).not.toHaveBeenCalled()

		drop()

		await vi.waitFor(() => expect(navigate).toHaveBeenCalled())
	})
})
