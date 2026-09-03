import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { BottomTabBar } from '../bottom-tab-bar'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('@/context/auth', () => ({ useAuth }))

/**
 * R6 lays the definitive shell, and it is the only step with global reach. The
 * bar is the whole of navigation below `lg` once the burger menu is gone, so
 * what is asserted is where each tab leads and that the active state follows the
 * URL — a tab pointing at the wrong route is invisible to `typecheck`.
 */
function renderBar(pathname = '/', pendingStickers = 0) {
	const Stub = createRoutesStub([
		{
			path: '*',
			Component: () => <BottomTabBar pendingStickers={pendingStickers} />,
		},
	])
	render(<Stub initialEntries={[pathname]} />)
}

const tab = (name: string) => page.getByRole('link', { name })

beforeEach(() => useAuth.mockReturnValue({ isAuthenticated: true }))
afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('BottomTabBar', () => {
	it.each([
		['Accueil', '/'],
		['Annonces', '/posts'],
		['Publier une annonce', '/publish'],
		['Scanner', '/scan'],
		['Compte', '/account'],
	])('%s leads to %s', async (name, href) => {
		renderBar()

		await expect.element(tab(name)).toHaveAttribute('href', href)
	})

	// The standing task the delivery notification cannot carry: it is read once,
	// twelve stickers take days. Named in the label, not colour alone.
	it('counts the stickers still waiting on the scanner tab', async () => {
		renderBar('/', 8)

		await expect.element(tab('Scanner — 8 à activer')).toBeVisible()
		await expect.element(page.getByText('8')).toBeVisible()
	})

	it('says nothing on the tab when nothing waits', async () => {
		renderBar('/', 0)

		await expect.element(tab('Scanner')).toBeVisible()
	})

	// Two digits do not fit under an icon; « Mes stickers » holds the exact one.
	it('caps the count it draws', async () => {
		renderBar('/', 24)

		await expect.element(page.getByText('9+')).toBeVisible()
		await expect.element(tab('Scanner — 24 à activer')).toBeVisible()
	})

	// « Alertes » left the bar to make room for the scanner; the header bell is
	// what keeps notifications reachable, and it must not come back here.
	it('no longer carries an alerts tab', async () => {
		renderBar()

		await expect.element(page.getByRole('navigation')).toBeInTheDocument()
		expect(
			await page.getByRole('link', { name: 'Alertes' }).elements(),
		).toHaveLength(0)
	})

	it('sends an anonymous visitor to sign in rather than to an account', async () => {
		useAuth.mockReturnValue({ isAuthenticated: false })
		renderBar()

		await expect.element(tab('Connexion')).toHaveAttribute('href', '/login')
		expect(
			await page.getByRole('link', { name: 'Compte' }).elements(),
		).toHaveLength(0)
	})

	it.each([
		['/', 'Accueil'],
		['/posts', 'Annonces'],
		['/posts/abc', 'Annonces'],
		['/scan', 'Scanner'],
		['/account/settings', 'Compte'],
	])('marks the tab for %s as current', async (pathname, name) => {
		renderBar(pathname)

		await expect.element(tab(name)).toHaveClass(/text-primary-green-text/)
	})

	// `/` must match exactly, or every route would light the home tab.
	it('does not light Accueil on another route', async () => {
		renderBar('/posts')

		await expect.element(tab('Accueil')).toHaveClass(/text-muted-foreground/)
	})
})
