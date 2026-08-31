import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { ThemeProvider } from '@/context/theme'
import { Header } from '../header'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('@/context/auth', () => ({ useAuth }))

/**
 * R6's acceptance criterion, in the one place it can be lost. The alerts tab
 * left the bar to make room for the scanner, so the bell is now the **only** way
 * to notifications on a phone — and the header's other controls are all
 * `hidden lg:*`. A bell that inherited that gating would take the route with it,
 * which is exactly how the auth screens lost their logo twice.
 */
function renderHeader() {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<ThemeProvider initialPreference="light">
					<Header />
				</ThemeProvider>
			),
		},
		{ path: '/notifications', loader: () => ({ items: [], unreadCount: 0 }) },
	])
	render(<Stub initialEntries={['/']} />)
}

const bell = () => page.getByRole('button', { name: 'Notifications' })

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('the notification bell in the header', () => {
	it.each([390, 768, 1280])(
		'is reachable at %ipx when signed in',
		async width => {
			await page.viewport(width, 900)
			useAuth.mockReturnValue({
				isAuthenticated: true,
				user: { name: 'Konan' },
			})
			renderHeader()

			await expect.element(bell()).toBeVisible()
		},
	)

	// The burger left with R6; nothing may reintroduce a menu button in its place.
	it('offers no menu button any more', async () => {
		await page.viewport(390, 900)
		useAuth.mockReturnValue({ isAuthenticated: true, user: { name: 'Konan' } })
		renderHeader()

		expect(
			await page.getByRole('button', { name: /ouvrir le menu/i }).elements(),
		).toHaveLength(0)
	})

	it('shows no bell to an anonymous visitor', async () => {
		await page.viewport(390, 900)
		useAuth.mockReturnValue({ isAuthenticated: false, user: null })
		renderHeader()

		expect(await bell().elements()).toHaveLength(0)
	})
})
