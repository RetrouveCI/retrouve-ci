import { cleanup, page, render } from '@/shared/helpers/testing'
import { OfflineBanner } from '../offline-banner'

/**
 * `navigator.onLine` is read-only, so the browser's own value is shadowed for
 * the length of a test and put back afterwards — the runner's page is shared by
 * every test in this file.
 */
function setOnLine(value: boolean) {
	Object.defineProperty(navigator, 'onLine', {
		configurable: true,
		get: () => value,
	})
	window.dispatchEvent(new Event(value ? 'online' : 'offline'))
}

afterEach(() => {
	cleanup()
	Reflect.deleteProperty(Navigator.prototype, 'onLine')
	Reflect.deleteProperty(navigator, 'onLine')
})

const banner = () => page.getByText('Vous êtes hors connexion')

describe('OfflineBanner', () => {
	it('says nothing while the network is there', async () => {
		setOnLine(true)
		render(<OfflineBanner />)

		expect(banner().elements()).toHaveLength(0)
	})

	it('explains itself once the network goes', async () => {
		setOnLine(false)
		render(<OfflineBanner />)

		await expect.element(banner()).toBeVisible()
	})

	it('appears on a page already open when the network drops', async () => {
		setOnLine(true)
		render(<OfflineBanner />)
		expect(banner().elements()).toHaveLength(0)

		setOnLine(false)

		await expect.element(banner()).toBeVisible()
	})

	it('goes away again when the network comes back', async () => {
		setOnLine(false)
		render(<OfflineBanner />)
		await expect.element(banner()).toBeVisible()

		setOnLine(true)

		await vi.waitFor(() => expect(banner().elements()).toHaveLength(0))
	})

	it('is announced, being a change the visitor did not ask for', async () => {
		setOnLine(false)
		render(<OfflineBanner />)

		await expect.element(page.getByRole('status')).toBeVisible()
	})
})
