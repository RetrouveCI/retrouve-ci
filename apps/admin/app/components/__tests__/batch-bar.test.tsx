import { useState } from 'react'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { BatchBar } from '../batch-bar'

function renderBar(props: Partial<React.ComponentProps<typeof BatchBar>> = {}) {
	const onConfirm = vi.fn()

	function Harness() {
		const [selected, setSelected] = useState(props.selected ?? ['a', 'b'])

		return (
			<BatchBar
				onClear={() => setSelected([])}
				action="Publier la sélection"
				confirmTitle="Publier 2 annonces ?"
				confirmBody="Elles deviennent visibles publiquement."
				onConfirm={onConfirm}
				{...props}
				// After the spread: the harness owns the selection, so clearing works.
				selected={selected}
			/>
		)
	}

	render(<Harness />)

	return { onConfirm }
}

const trigger = () => page.getByRole('button', { name: 'Publier la sélection' })

describe('BatchBar', () => {
	it('says nothing when nothing is selected', async () => {
		renderBar({ selected: [] })

		expect(page.getByRole('region', { name: 'Sélection' }).elements()).toEqual(
			[],
		)
	})

	it('counts the selection and agrees in number', async () => {
		renderBar({ selected: ['a', 'b', 'c'] })

		await expect
			.element(page.getByRole('region', { name: 'Sélection' }))
			.toHaveTextContent(/3 sélectionnés/)
	})

	it('agrees in the singular', async () => {
		renderBar({ selected: ['a'] })

		await expect
			.element(page.getByRole('region', { name: 'Sélection' }))
			.toHaveTextContent(/1 sélectionné(?!s)/)
	})

	// A batch is the one gesture where a mis-click multiplies itself.
	it('asks before doing anything', async () => {
		const { onConfirm } = renderBar()

		await userEvent.click(trigger())

		await expect.element(page.getByText('Publier 2 annonces ?')).toBeVisible()
		expect(onConfirm).not.toHaveBeenCalled()
	})

	it('acts once the question is answered', async () => {
		const { onConfirm } = renderBar()

		await userEvent.click(trigger())
		await userEvent.click(
			page.getByRole('button', { name: 'Publier la sélection' }).last(),
		)

		await vi.waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
	})

	it('does nothing when the question is declined', async () => {
		const { onConfirm } = renderBar()

		await userEvent.click(trigger())
		await userEvent.click(page.getByRole('button', { name: 'Annuler' }))

		expect(onConfirm).not.toHaveBeenCalled()
	})

	// The orders list blocks a mixed selection, and says why rather than going
	// quiet: a button that cannot be pressed must explain itself.
	it('says why it is out of reach', async () => {
		renderBar({
			disabled: true,
			hint: 'Sélectionnez des commandes au même statut',
		})

		await expect.element(trigger()).toBeDisabled()
		await expect
			.element(page.getByText('Sélectionnez des commandes au même statut'))
			.toBeVisible()
	})

	it('lets the selection be dropped', async () => {
		renderBar()

		await userEvent.click(
			page.getByRole('button', { name: 'Tout désélectionner' }),
		)

		expect(page.getByRole('region', { name: 'Sélection' }).elements()).toEqual(
			[],
		)
	})
})
