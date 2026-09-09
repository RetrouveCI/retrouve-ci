import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { startInstallPromptCapture } from '@/shared/helpers/install-prompt'
import Download from '../_index'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari'
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-A546B) Chrome/126 Mobile'

const prompt = vi.fn()

function browserOffersInstall() {
	const event = new Event('beforeinstallprompt')
	Object.assign(event, {
		prompt,
		userChoice: Promise.resolve({ outcome: 'accepted' }),
	})
	window.dispatchEvent(event)
}

/** `navigator` is read-only, so the value is shadowed and taken back after. */
function pretendPlatform(userAgent: string, maxTouchPoints: number) {
	Object.defineProperty(navigator, 'userAgent', {
		configurable: true,
		get: () => userAgent,
	})
	Object.defineProperty(navigator, 'maxTouchPoints', {
		configurable: true,
		get: () => maxTouchPoints,
	})
}

const realMatchMedia = window.matchMedia.bind(window)

function pretendInstalled() {
	vi.stubGlobal('matchMedia', (query: string) =>
		query === '(display-mode: standalone)'
			? { matches: true, addEventListener() {}, removeEventListener() {} }
			: realMatchMedia(query),
	)
}

function renderPage() {
	const Stub = createRoutesStub([{ path: '/download', Component: Download }])
	render(<Stub initialEntries={['/download']} />)
}

const installButton = () =>
	page.getByRole('button', { name: 'Installer maintenant' })

let stopCapture: () => void

beforeEach(() => {
	prompt.mockReset().mockResolvedValue(undefined)
	pretendPlatform(ANDROID, 5)
	stopCapture = startInstallPromptCapture()
})

afterEach(() => {
	cleanup()
	window.dispatchEvent(new Event('appinstalled'))
	stopCapture()
	vi.unstubAllGlobals()
	Reflect.deleteProperty(navigator, 'userAgent')
	Reflect.deleteProperty(navigator, 'maxTouchPoints')
})

describe('the install page', () => {
	it('offers the button once the browser has an install to give', async () => {
		browserOffersInstall()
		renderPage()

		await userEvent.click(installButton())

		expect(prompt).toHaveBeenCalled()
	})

	it('shows no button on a browser that offers no install', () => {
		renderPage()

		expect(installButton().elements()).toHaveLength(0)
	})

	it('names the menu alone when there is no button to point at', async () => {
		renderPage()

		await expect
			.element(page.getByText(/Ouvrez le menu/, { exact: false }))
			.toBeVisible()
	})

	it('points at the button when there is one', async () => {
		browserOffersInstall()
		renderPage()

		await expect
			.element(page.getByText(/ci-dessus/, { exact: false }))
			.toBeVisible()
	})

	it('promises no alert the app cannot send', () => {
		renderPage()

		expect(page.getByText(/app fermée/).elements()).toHaveLength(0)
	})
})

describe('the platform the visitor is on', () => {
	it('opens on the iPhone column for an iPhone, which never gets a button', async () => {
		pretendPlatform(IPHONE, 5)
		renderPage()

		await expect
			.element(page.getByRole('button', { name: 'iPhone' }))
			.toHaveAttribute('aria-pressed', 'true')
		await expect
			.element(page.getByText(/Partager/, { exact: false }))
			.toBeVisible()
	})

	it('opens on the Android column otherwise', async () => {
		renderPage()

		await expect
			.element(page.getByRole('button', { name: 'Android' }))
			.toHaveAttribute('aria-pressed', 'true')
	})

	it('lets an iPhone visitor read the Android steps anyway', async () => {
		pretendPlatform(IPHONE, 5)
		renderPage()

		await userEvent.click(page.getByRole('button', { name: 'Android' }))

		await expect
			.element(page.getByText(/Ouvrez le menu/, { exact: false }))
			.toBeVisible()
	})
})

describe('an app already on the home screen', () => {
	it('says so instead of explaining an install that is done', async () => {
		pretendInstalled()
		browserOffersInstall()
		renderPage()

		await expect
			.element(page.getByText("L'application est installée"))
			.toBeVisible()
		expect(installButton().elements()).toHaveLength(0)
		expect(
			page.getByRole('button', { name: 'Android' }).elements(),
		).toHaveLength(0)
	})
})
