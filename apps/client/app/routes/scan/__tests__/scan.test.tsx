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
 * The WASM decoder is the one thing these tests must not really load: a megabyte
 * of binary per run, to assert nothing about it. `ponyfill` is how each test
 * says what the mocked module then does.
 */
const ponyfill = {
	throws: false,
	detect: async (): Promise<{ rawValue: string }[]> => [],
}

vi.mock('barcode-detector/ponyfill', () => ({
	BarcodeDetector: class {
		constructor() {
			if (ponyfill.throws) throw new Error('offline')
		}
		detect = () => ponyfill.detect()
	},
	setZXingModuleOverrides: () => undefined,
}))

async function photoOfASticker() {
	const canvas = document.createElement('canvas')
	canvas.width = 2
	canvas.height = 2

	const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve))
	if (!blob) throw new Error('the test could not build an image')

	return new File([blob], 'sticker.png', { type: 'image/png' })
}

async function takeAPhoto() {
	const input = document.querySelector<HTMLInputElement>('input[type="file"]')
	if (!input) throw new Error('the photo fallback is not on screen')

	await userEvent.upload(input, await photoOfASticker())
}

async function refuseTheCamera() {
	getUserMedia.mockRejectedValue(new DOMException('', 'NotAllowedError'))
	renderScan()
	await userEvent.click(
		page.getByRole('button', { name: 'Autoriser la caméra' }),
	)
}

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
	ponyfill.throws = false
	ponyfill.detect = async () => []
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

	// R20 refused a viewfinder that could never read; R21 gives Safari a decoder.
	it('opens the viewfinder on a browser with no detector of its own', async () => {
		getUserMedia.mockResolvedValue(new MediaStream())

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)

		await expect
			.element(page.getByRole('dialog', { name: 'Scanner un code' }))
			.toBeVisible()
		expect(getUserMedia).toHaveBeenCalledOnce()
	})

	it('falls back to the code entry when the decoder cannot be fetched', async () => {
		ponyfill.throws = true
		getUserMedia.mockResolvedValue(new MediaStream())

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)

		await expect
			.element(page.getByText("La lecture automatique n'est pas disponible"))
			.toBeVisible()
		await expect.element(page.getByLabelText('Code du sticker')).toBeVisible()
	})

	// The photo fallback needs the very decoder that just failed to load.
	it('offers no photograph when the decoder itself is missing', async () => {
		ponyfill.throws = true
		getUserMedia.mockResolvedValue(new MediaStream())

		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Autoriser la caméra' }),
		)
		await expect
			.element(page.getByText("La lecture automatique n'est pas disponible"))
			.toBeVisible()

		expect(
			page.getByRole('button', { name: /Prendre une photo/ }).elements(),
		).toHaveLength(0)
	})

	it('offers the photograph when the camera is refused', async () => {
		await refuseTheCamera()

		await expect
			.element(
				page.getByRole('button', { name: 'Prendre une photo du sticker' }),
			)
			.toBeVisible()
	})

	it('reads a sticker code off a photograph', async () => {
		ponyfill.detect = async () => [
			{ rawValue: 'https://retrouve.ci/q/RCI-ABC123' },
		]
		await refuseTheCamera()

		await takeAPhoto()

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})

	it('names a photograph whose QR leads somewhere else', async () => {
		ponyfill.detect = async () => [{ rawValue: 'https://example.com/' }]
		await refuseTheCamera()

		await takeAPhoto()

		await expect
			.element(page.getByText("Ce code n'est pas un sticker RetrouveCI"))
			.toBeVisible()
	})

	it('names a photograph that carries no QR at all', async () => {
		await refuseTheCamera()

		await takeAPhoto()

		await expect
			.element(page.getByText('Aucun QR code sur cette photo'))
			.toBeVisible()
	})

	it('adds the hyphen and the upper case to a pasted code', async () => {
		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Saisir le code à la main' }),
		)

		const field = page.getByLabelText('Code du sticker')
		await userEvent.fill(field, 'rciabc123')

		await expect.element(field).toHaveValue('RCI-ABC123')
	})

	it('leaves a pasted scan link for the parser', async () => {
		renderScan()
		await userEvent.click(
			page.getByRole('button', { name: 'Saisir le code à la main' }),
		)
		await userEvent.fill(
			page.getByLabelText('Code du sticker'),
			'https://retrouve.ci/q/RCI-ABC123',
		)
		await userEvent.click(page.getByRole('button', { name: 'Continuer' }))

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})
})
