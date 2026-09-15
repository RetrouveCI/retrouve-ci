import { page, render, userEvent } from '@/shared/helpers/testing'
import { ManualCodeForm } from '../manual-code-form'

const submit = () =>
	page.getByRole('button', { name: /Continuer|Vérification/ })
const field = () => page.getByRole('textbox')

describe('ManualCodeForm', () => {
	it('hands a typed code up, formatted', async () => {
		const onCode = vi.fn()
		render(<ManualCodeForm onCode={onCode} />)

		await userEvent.fill(field(), 'rci123456')
		await userEvent.click(submit())

		await vi.waitFor(() => expect(onCode).toHaveBeenCalledWith('RCI-123456'))
	})

	/**
	 * The viewfinder says « Un instant… » while a scanned code is checked;
	 * typing one said nothing at all, so the screen looked stuck.
	 */
	it('says it is checking, and refuses a second submission meanwhile', async () => {
		const onCode = vi.fn()
		render(<ManualCodeForm onCode={onCode} pending />)

		await expect.element(submit()).toHaveTextContent('Vérification')
		await expect.element(submit()).toBeDisabled()
		await expect.element(submit()).toHaveAttribute('aria-busy', 'true')
	})

	it('offers to go back only when there is something to go back to', async () => {
		render(<ManualCodeForm onCode={vi.fn()} />)

		expect(
			page.getByRole('button', { name: /Revenir au scanner/ }).elements(),
		).toEqual([])
	})
})
