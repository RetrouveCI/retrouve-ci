import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import {
	startInstallPromptCapture,
	SUCCESS_PARAM,
} from '@/shared/helpers/install-prompt'
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
		{
			path: '/account/posts',
			Component: () => <InstallPrompt after="published" />,
		},
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

describe('when the install sheet may open', () => {
	it('stays shut on a screen that has not just succeeded', () => {
		browserOffersInstall()
		renderAt('/account/posts')

		expect(sheet().elements()).toHaveLength(0)
	})

	it('stays shut when the browser has offered nothing to install', async () => {
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)

		expect(sheet().elements()).toHaveLength(0)
	})

	it('stays shut for a success it does not name', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=activated`)

		expect(sheet().elements()).toHaveLength(0)
	})

	it('opens once the listing is published and the browser can install', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)

		await expect.element(sheet()).toBeVisible()
	})

	it('promises only what the app delivers', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)

		await expect
			.element(page.getByText('Les annonces déjà consultées, hors connexion'))
			.toBeVisible()
		expect(page.getByText(/app fermée/).elements()).toHaveLength(0)
	})
})

describe('answering the sheet', () => {
	it('hands the visitor to the browser own dialog', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)

		await userEvent.click(
			page.getByRole('button', { name: "Installer l'application" }),
		)

		expect(prompt).toHaveBeenCalled()
	})

	it('closes on « Plus tard »', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)
		await expect.element(sheet()).toBeVisible()

		await userEvent.click(page.getByRole('button', { name: 'Plus tard' }))

		await vi.waitFor(() => expect(sheet().elements()).toHaveLength(0))
	})

	it('takes « Plus tard » as final, on this success and the next', async () => {
		browserOffersInstall()
		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)
		await userEvent.click(page.getByRole('button', { name: 'Plus tard' }))
		cleanup()

		renderAt(`/account/posts?${SUCCESS_PARAM}=published`)

		expect(sheet().elements()).toHaveLength(0)
		expect(localStorage.getItem(KEY)).toBe('1')
	})
})
