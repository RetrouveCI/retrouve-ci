import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { ThemeProvider } from '@/context/theme'
import { Header } from '../header'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('@/context/auth', () => ({ useAuth }))

/**
 * R7 gave the header's free space to the search, which had no home in it at all.
 * Two things are guarded here because neither is visible to `typecheck`: where
 * the search sends you, and that the two publish actions are **two targets**
 * rather than a menu that hides them — §2.3 rule 3 asks for those exact words
 * wherever they appear.
 */
function renderHeader(tall = false) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<ThemeProvider initialPreference="light">
					<Header />
					{tall && <div style={{ height: '3000px' }} />}
				</ThemeProvider>
			),
		},
		{ path: '/notifications', loader: () => ({ items: [], unreadCount: 0 }) },
	])
	render(<Stub initialEntries={['/']} />)
}

/** Raw DOM reads do not retry, so mounting is awaited through a locator first. */
const mounted = () =>
	expect.element(page.getByAltText('RetrouveCI')).toBeInTheDocument()

beforeEach(() => {
	useAuth.mockReturnValue({ isAuthenticated: false, user: null })
})

afterEach(async () => {
	cleanup()
	vi.restoreAllMocks()
	window.scrollTo(0, 0)
})

describe('the desktop header', () => {
	it('carries a search that reaches the listings from any page', async () => {
		await page.viewport(1440, 900)
		renderHeader()
		await mounted()
		const form = document.querySelector('header form[role="search"]')

		expect(form?.getAttribute('action')).toBe('/posts')
		expect(form?.querySelector('input[name="q"]')).not.toBeNull()
	})

	// Two targets, not a dropdown: the old header hid both behind « Publier ».
	it.each([
		["J'ai perdu", '/publish/lost'],
		["J'ai trouvé", '/publish/found'],
	])('offers %s as its own link to %s', async (label, href) => {
		await page.viewport(1440, 900)
		renderHeader()

		await expect
			.element(page.getByRole('link', { name: label }))
			.toHaveAttribute('href', href)
	})

	// §2.3 rule 3: the words are the hero's and the form's, never « Objet perdu ».
	it('never says Objet perdu', async () => {
		await page.viewport(1440, 900)
		renderHeader()
		await mounted()

		expect(document.querySelector('header')?.textContent).not.toMatch(
			/Objet (perdu|trouvé)/,
		)
	})

	it('leads home from the mark rather than spending a slot on Accueil', async () => {
		await page.viewport(1440, 900)
		renderHeader()

		expect(
			await page.getByRole('link', { name: 'Accueil' }).elements(),
		).toHaveLength(0)
		await expect.element(page.getByAltText('RetrouveCI')).toBeInTheDocument()
	})

	/**
	 * On scroll the links give way and the search stays — it is what someone
	 * returning to the top of a list is reaching for.
	 */
	it('drops the links but keeps the search once scrolled', async () => {
		await page.viewport(1440, 900)
		renderHeader(true)

		await expect
			.element(page.getByRole('link', { name: 'Annonces' }))
			.toBeInTheDocument()

		window.scrollTo(0, 400)
		await vi.waitFor(() => {
			expect(document.querySelectorAll('header nav a')).toHaveLength(0)
		})
		expect(document.querySelector('header form[role="search"]')).not.toBeNull()
	})
})
