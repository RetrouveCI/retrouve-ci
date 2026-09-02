import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import { startInstallPromptCapture } from '@/shared/helpers/install-prompt'
import { InstallPrompt } from '../install-prompt'

const KEY = 'retrouveci.install-declined.v1'

const prompt = vi.fn()

/** Stands in for what Chromium hands over shortly after `load`. */
function browserOffersInstall(outcome: 'accepted' | 'dismissed' = 'accepted') {
	const event = new Event('beforeinstallprompt')
	Object.assign(event, {
		prompt,
		userChoice: Promise.resolve({ outcome }),
	})
	window.dispatchEvent(event)
}

function renderAt(url: string) {
	const Stub = createRoutesStub([
		{ path: '/', Component: InstallPrompt },
		{ path: '/posts', Component: InstallPrompt },
		{ path: '/q/:code', Component: InstallPrompt },
	])
	render(<Stub initialEntries={[url]} />)
}

const sheet = () =>
	page.getByText('Gardez RetrouveCI à portée de pouce', { exact: true })

let stopCapture: () => void

beforeEach(() => {
	stopAnimations()
	prompt.mockReset().mockResolvedValue(undefined)
	localStorage.removeItem(KEY)
	stopCapture = startInstallPromptCapture()
})

afterEach(() => {
	cleanup()
	// The runner's page is shared, and the module keeps the offer: `appinstalled`
	// is how the store is emptied between tests.
	window.dispatchEvent(new Event('appinstalled'))
	stopCapture()
	localStorage.removeItem(KEY)
})

describe('when the install sheet opens', () => {
	it('opens on arrival, once the browser has an install to give', async () => {
		browserOffersInstall()
		renderAt('/')

		await expect.element(sheet()).toBeVisible()
	})

	it('opens on any entry point, not only the home page', async () => {
		browserOffersInstall()
		renderAt('/posts')

		await expect.element(sheet()).toBeVisible()
	})

	it('stays shut when the browser has offered nothing to install', () => {
		renderAt('/')

		expect(sheet().elements()).toHaveLength(0)
	})

	it('never covers the contact page of a scanned sticker', () => {
		browserOffersInstall()
		renderAt('/q/RCI-ABC123')

		expect(sheet().elements()).toHaveLength(0)
	})

	it('promises only what the app delivers', async () => {
		browserOffersInstall()
		renderAt('/')

		await expect
			.element(page.getByText('Les annonces déjà consultées, hors connexion'))
			.toBeVisible()
		expect(page.getByText(/app fermée/).elements()).toHaveLength(0)
	})
})

describe('answering the sheet', () => {
	it('hands the visitor to the browser own dialog', async () => {
		browserOffersInstall()
		renderAt('/')

		await userEvent.click(
			page.getByRole('button', { name: "Installer l'application" }),
		)

		expect(prompt).toHaveBeenCalled()
	})

	it('closes on « Plus tard »', async () => {
		browserOffersInstall()
		renderAt('/')
		await expect.element(sheet()).toBeVisible()

		await userEvent.click(page.getByRole('button', { name: 'Plus tard' }))

		await vi.waitFor(() => expect(sheet().elements()).toHaveLength(0))
	})

	it('takes « Plus tard » as final, on this visit and the next', async () => {
		browserOffersInstall()
		renderAt('/')
		await userEvent.click(page.getByRole('button', { name: 'Plus tard' }))
		cleanup()

		renderAt('/')

		expect(sheet().elements()).toHaveLength(0)
		expect(localStorage.getItem(KEY)).toBe('1')
	})

	it('remembers nothing when the sheet is merely swiped away', async () => {
		browserOffersInstall()
		renderAt('/')
		await expect.element(sheet()).toBeVisible()

		await userEvent.keyboard('{Escape}')
		await vi.waitFor(() => expect(sheet().elements()).toHaveLength(0))

		expect(localStorage.getItem(KEY)).toBeNull()
	})
})
