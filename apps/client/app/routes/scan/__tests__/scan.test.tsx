import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import type { StickerStatus } from '@/shared/types/sticker'
import ScanPage from '../_index'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('@/context/auth', () => ({ useAuth }))

interface ScanScenario {
	/** What `/scan/status` answers; `null` stands for « send them to /q/:code ». */
	status?: StickerStatus | null
	activation?: { success: boolean; errors?: Record<string, unknown> }
}

let statusAsked: string[]

function renderScan({ status = null, activation }: ScanScenario = {}) {
	statusAsked = []

	const Stub = createRoutesStub([
		{
			path: '/scan',
			Component: ScanPage,
			action: () => activation ?? { success: true },
		},
		{
			path: '/scan/status',
			loader: ({ request }: { request: Request }) => {
				const code = new URL(request.url).searchParams.get('code') ?? ''
				statusAsked.push(code)

				return { code, status }
			},
		},
		{ path: '/q/:code', Component: () => <p>Page du sticker</p> },
		{ path: '/account/stickers', Component: () => <p>Mes stickers</p> },
	])
	render(<Stub initialEntries={['/scan']} />)
}

async function typeTheCode(code = 'RCI-ABC123') {
	await userEvent.click(
		page.getByRole('button', { name: 'Saisir le code à la main' }),
	)
	await userEvent.fill(page.getByLabelText('Code du sticker'), code)
	await userEvent.click(page.getByRole('button', { name: 'Continuer' }))
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
	useAuth.mockReturnValue({ isAuthenticated: false })
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

/**
 * R22's fork, and the one invariant it must not break: `/q/:code` stays the
 * single contact screen of flux B. The sheet only ever opens on the one case
 * that screen has nothing to say to — a sticker its own owner has yet to name.
 */
describe('ScanPage — activation', () => {
	it('asks nothing about a code read by a visitor with no account', async () => {
		renderScan({ status: 'generated' })

		await typeTheCode()

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
		expect(statusAsked).toEqual([])
	})

	it('opens the activation sheet on a sticker still waiting', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'generated' })

		await typeTheCode()

		await expect.element(page.getByText('Sticker reconnu')).toBeVisible()
		await expect
			.element(page.getByText('Sur quel objet le collez-vous ?'))
			.toBeVisible()
		expect(statusAsked).toEqual(['RCI-ABC123'])
	})

	it('names the consequence before the sticker is activated', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'generated' })

		await typeTheCode()

		await expect
			.element(page.getByText(/quiconque scanne ce sticker peut vous joindre/))
			.toBeVisible()
	})

	it('sends an already activated sticker to its contact page', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'activated' })

		await typeTheCode()

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})

	it('sends a revoked sticker to its contact page', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'revoked' })

		await typeTheCode()

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})

	// An unreadable status is not a reason to offer an activation that would
	// fail: the contact screen is the honest destination.
	it('sends the visitor to the contact page when the status cannot be read', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: null })

		await typeTheCode()

		await expect.element(page.getByText('Page du sticker')).toBeVisible()
	})

	it('refuses an empty name on the field, not on the API', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'generated' })
		await typeTheCode()

		await userEvent.click(
			page.getByRole('button', { name: 'Activer ce sticker' }),
		)

		await expect
			.element(page.getByText('Donnez un nom à ce sticker'))
			.toBeVisible()
	})

	// The acceptance criterion: twelve stickers, and never a code to type.
	it('offers the next sticker once one is activated', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'generated' })
		await typeTheCode()

		await userEvent.fill(
			page.getByLabelText('Sur quel objet le collez-vous ?'),
			'Clés de la maison',
		)
		await userEvent.click(
			page.getByRole('button', { name: 'Activer ce sticker' }),
		)

		await expect.element(page.getByText('Sticker activé')).toBeVisible()
		await expect
			.element(page.getByRole('button', { name: 'Scanner le suivant' }))
			.toBeVisible()
	})

	it('leaves for « Mes stickers » on « Terminer »', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({ status: 'generated' })
		await typeTheCode()
		await userEvent.fill(
			page.getByLabelText('Sur quel objet le collez-vous ?'),
			'Clés de la maison',
		)
		await userEvent.click(
			page.getByRole('button', { name: 'Activer ce sticker' }),
		)
		await expect.element(page.getByText('Sticker activé')).toBeVisible()

		await userEvent.click(page.getByRole('button', { name: 'Terminer' }))

		await expect.element(page.getByText('Mes stickers')).toBeVisible()
	})

	it('shows a failure inside the sheet rather than as a toast', async () => {
		useAuth.mockReturnValue({ isAuthenticated: true })
		renderScan({
			status: 'generated',
			activation: {
				success: false,
				errors: { root: { message: 'Ce sticker est déjà activé' } },
			},
		})
		await typeTheCode()

		await userEvent.fill(
			page.getByLabelText('Sur quel objet le collez-vous ?'),
			'Clés de la maison',
		)
		await userEvent.click(
			page.getByRole('button', { name: 'Activer ce sticker' }),
		)

		await expect
			.element(page.getByText('Ce sticker est déjà activé'))
			.toBeVisible()
	})
})
