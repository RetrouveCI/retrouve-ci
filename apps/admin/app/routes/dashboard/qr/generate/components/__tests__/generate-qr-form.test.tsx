import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { GenerateQrForm } from '../generate-qr-form'
import type { QrToken } from '../../../types/qr.types'

const token: QrToken = {
	id: 'tok-1',
	code: 'RCI-0001',
	status: 'generated',
	batch: 'Batch-Juillet-2026',
	label: null,
	linkedObject: null,
	userId: null,
	createdAt: '2026-08-20T10:00:00.000Z',
	activatedAt: null,
	revokedAt: null,
}

function renderForm(action: (args: { request: Request }) => unknown) {
	const Stub = createRoutesStub([
		{ path: '/qr/generate', Component: GenerateQrForm, action },
	])

	render(<Stub initialEntries={['/qr/generate']} />)
}

const quantity = () => page.getByRole('combobox', { name: /Quantité/ })
const batch = () => page.getByLabelText(/^Nom du Batch/)
const exportCheckbox = () => page.getByRole('checkbox')
const submit = () => page.getByRole('button', { name: 'Générer' })

const ok = () => ({ success: true, data: [token] }) as ActionResult<QrToken[]>

/**
 * Downloading for real would have headless Chromium fetch a blob URL, so the
 * anchor click is stubbed and the generated CSV is read back off the Blob handed
 * to `createObjectURL`.
 */
function stubDownload() {
	const blobs: Blob[] = []

	vi.spyOn(URL, 'createObjectURL').mockImplementation(source => {
		blobs.push(source as Blob)
		return 'blob:stub'
	})
	vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
	const click = vi
		.spyOn(HTMLAnchorElement.prototype, 'click')
		.mockImplementation(() => {})

	return { blobs, click }
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('GenerateQrForm', () => {
	it('renders the three fields with their defaults', async () => {
		renderForm(ok)

		await expect.element(quantity()).toHaveTextContent('100')
		await expect.element(batch()).toHaveValue('')
		await expect.element(exportCheckbox()).toBeChecked()
	})

	it('reports the schema message without reaching the action', async () => {
		const action = vi.fn(ok)
		renderForm(action)

		await userEvent.fill(batch(), 'B'.repeat(61))
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Maximum 60 caractères'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('submits the selected quantity and the batch name', async () => {
		const received: Record<string, string> = {}
		stubDownload()
		renderForm(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await userEvent.click(quantity())
		await userEvent.click(page.getByRole('option', { name: '250' }))
		await userEvent.fill(batch(), 'Batch-Juillet-2026')
		await userEvent.click(submit())

		await vi.waitFor(() => expect(received.count).toBe('250'))
		expect(received.batch).toBe('Batch-Juillet-2026')
	})

	it('downloads the returned tokens as a CSV when the box is checked', async () => {
		const { blobs, click } = stubDownload()
		renderForm(ok)

		await userEvent.click(submit())

		await vi.waitFor(() => expect(click).toHaveBeenCalledOnce())
		expect(await blobs[0].text()).toBe(
			'code,batch,status,createdAt\n' +
				'RCI-0001,Batch-Juillet-2026,generated,2026-08-20T10:00:00.000Z',
		)
	})

	it('generates without downloading when the box is unchecked', async () => {
		const action = vi.fn(ok)
		const { click } = stubDownload()
		renderForm(action)

		await userEvent.click(exportCheckbox())
		await expect.element(exportCheckbox()).not.toBeChecked()
		await userEvent.click(submit())

		await vi.waitFor(() => expect(action).toHaveBeenCalledOnce())
		expect(click).not.toHaveBeenCalled()
	})

	it('downloads once even though the success payload stays around', async () => {
		const { click } = stubDownload()
		renderForm(ok)

		await userEvent.click(submit())
		await vi.waitFor(() => expect(click).toHaveBeenCalledOnce())

		await userEvent.fill(batch(), 'Batch-Août-2026')
		expect(click).toHaveBeenCalledOnce()
	})

	it('renders a root error when the action reports one', async () => {
		renderForm(
			() =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Quota de tokens atteint' },
					},
				}) as ActionResult<QrToken[]>,
		)

		await userEvent.click(submit())

		await expect
			.element(page.getByText('Impossible de générer les tokens'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Quota de tokens atteint'))
			.toBeInTheDocument()
	})

	it('lands a server-side field error on the field it belongs to', async () => {
		renderForm(
			() =>
				({
					success: false,
					errors: { count: { type: 'custom', message: 'Lot trop grand' } },
				}) as ActionResult<QrToken[]>,
		)

		await userEvent.click(submit())

		await expect.element(page.getByText('Lot trop grand')).toBeInTheDocument()
	})
})
