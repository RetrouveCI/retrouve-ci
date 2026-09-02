import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import ScanPage from '../_index'

function renderScan() {
	const Stub = createRoutesStub([
		{ path: '/scan', Component: ScanPage },
		{ path: '/q/:code', Component: () => <p>Page du sticker</p> },
	])
	render(<Stub initialEntries={['/scan']} />)
}

let getUserMedia: ReturnType<typeof vi.fn>

/**
 * Chromium on a build machine ships no `BarcodeDetector`, so the absence has to
 * be stated rather than inherited — otherwise the test that asserts the Safari
 * branch would pass for the wrong reason, and turn red the day it does ship.
 */
function withDetector(
	detect: () => Promise<{ rawValue: string }[]> = async () => [],
) {
	vi.stubGlobal(
		'BarcodeDetector',
		class {
			detect = detect
		},
	)
}

beforeEach(() => {
	getUserMedia = vi.fn()
	vi.stubGlobal('BarcodeDetector', undefined)
	vi.stubGlobal('navigator', {
		...navigator,
		mediaDevices: { getUserMedia },
	})
})

afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('ScanPage', () => {
	// The acceptance criterion of R20, and the one thing that cannot be undone:
	// a camera refused once is refused for the origin until the visitor digs
	// through browser settings.
	it('asks for no permission on load', async () => {
		renderScan()

		await expect
			.element(page.getByRole('heading', { name: 'Scanner un sticker' }))
			.toBeVisible()
		expect(getUserMedia).not.toHaveBeenCalled()
	})

	it('explains the camera before the system is ever asked', async () => {
		renderScan()

		await expect
			.element(page.getByText('Autoriser la caméra pour scanner'))
			.toBeVisible()
		await expect
			.element(page.getByRole('button', { name: 'Autoriser la caméra' }))
			.toBeVisible()
	})

	it('opens the code entry without touching the camera', async () => {
		renderScan()

		await userEvent.click(
			page.getByRole('button', { name: 'Saisir le code à la main' }),
		)

		await expect.element(page.getByLabelText('Code du sticker')).toBeVisible()
		expect(getUserMedia).not.toHaveBeenCalled()
	})

	it('sends a hand-typed code to its sticker page', async () => {
		renderScan()

		await userEvent.click(
			page.getByRole('button', { name: 'Saisir le code à la main' }),
		)
		await userEvent.fill(page.getByLabelText('Code du sticker'), 'rci abc123')
		await userEvent.click(page.getByRole('button', { name: 'Continuer' }))

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})

	it('refuses a code that belongs to no sticker, on the field', async () => {
		renderScan()

		await userEvent.click(
			page.getByRole('button', { name: 'Saisir le code à la main' }),
		)
		await userEvent.fill(page.getByLabelText('Code du sticker'), 'HELLO')
		await userEvent.click(page.getByRole('button', { name: 'Continuer' }))

		await expect
			.element(
				page.getByText('Ce code ne correspond à aucun sticker RetrouveCI'),
			)
			.toBeVisible()
	})

	it('opens the viewfinder once the camera is allowed', async () => {
		withDetector()
		getUserMedia.mockResolvedValue(new MediaStream())

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)

		await expect
			.element(page.getByRole('dialog', { name: 'Scanner un code' }))
			.toBeVisible()
		await expect
			.element(page.getByText('Visez le QR code du sticker'))
			.toBeVisible()
		expect(getUserMedia).toHaveBeenCalledOnce()
	})

	it('closes the viewfinder on Escape and releases the page', async () => {
		withDetector()
		getUserMedia.mockResolvedValue(new MediaStream())

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)
		await expect
			.element(page.getByRole('dialog', { name: 'Scanner un code' }))
			.toBeVisible()
		expect(document.body.style.overflow).toBe('hidden')

		await userEvent.keyboard('{Escape}')

		await expect
			.element(page.getByText('Autoriser la caméra pour scanner'))
			.toBeVisible()
		expect(document.body.style.overflow).not.toBe('hidden')
	})

	it('falls back to the code entry when the camera is refused', async () => {
		withDetector()
		getUserMedia.mockRejectedValue(new DOMException('', 'NotAllowedError'))

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)

		await expect
			.element(page.getByText("La caméra n'est pas accessible"))
			.toBeVisible()
		await expect.element(page.getByLabelText('Code du sticker')).toBeVisible()
	})

	// Safari has no BarcodeDetector and the WASM decoder only lands at R21, so a
	// viewfinder that can never read is not offered: the code entry takes over.
	it('leads straight to the code entry when nothing can decode', async () => {
		renderScan()

		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)

		await expect
			.element(page.getByText("La lecture automatique n'est pas disponible"))
			.toBeVisible()
		await expect.element(page.getByLabelText('Code du sticker')).toBeVisible()
		expect(getUserMedia).not.toHaveBeenCalled()
	})
})
