import { createRoutesStub, useLocation } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { ListToolbar } from '../list-toolbar'

function Location() {
	return <p data-testid="location">{useLocation().search}</p>
}

function renderToolbar(entry = '/orders') {
	const Stub = createRoutesStub([
		{
			path: '/orders',
			Component: () => (
				<>
					<ListToolbar
						chips={[
							{ value: 'all', label: 'Toutes', count: 1284 },
							{ value: 'pending', label: 'En attente', count: 12 },
							{ value: 'shipped', label: 'Expédiées' },
						]}
						searchPlaceholder="N° de commande…"
					/>
					<Location />
				</>
			),
		},
	])

	render(<Stub initialEntries={[entry]} />)
}

const location = () => page.getByTestId('location')
const chip = (name: RegExp) => page.getByRole('button', { name })

describe('ListToolbar', () => {
	it('marks the chip the URL names', async () => {
		renderToolbar('/orders?status=pending')

		await expect
			.element(chip(/En attente/))
			.toHaveAttribute('aria-pressed', 'true')
		await expect
			.element(chip(/Toutes/))
			.toHaveAttribute('aria-pressed', 'false')
	})

	it('reads no status as « Toutes »', async () => {
		renderToolbar()

		await expect.element(chip(/Toutes/)).toHaveAttribute('aria-pressed', 'true')
	})

	// `toHaveTextContent` folds the narrow no-break space `formatNumber` writes
	// into a plain one, so the grouping is matched as whitespace, not as a string.
	it('counts in French, and says nothing where no count was read', async () => {
		renderToolbar()

		await expect.element(chip(/Toutes/)).toHaveTextContent(/Toutes\s*1\s284/)
		await expect.element(chip(/Expédiées/)).toHaveTextContent(/^Expédiées$/)
	})

	// A filter changes what page 3 means, so it always goes back to the first.
	it('writes the chosen chip into the URL and returns to the first page', async () => {
		renderToolbar('/orders?page=3&q=abc')

		await userEvent.click(chip(/En attente/))

		await expect.element(location()).toHaveTextContent('?q=abc&status=pending')
	})

	it('clears the axis when « Toutes » is chosen', async () => {
		renderToolbar('/orders?status=pending')

		await userEvent.click(chip(/Toutes/))

		await expect.element(location()).toHaveTextContent(/^$/)
	})

	it('sends a trimmed search, keeping the filter and dropping the page', async () => {
		renderToolbar('/orders?status=pending&page=2')

		await userEvent.fill(
			page.getByRole('searchbox', { name: 'Rechercher' }),
			'  RCI-7K  ',
		)
		await userEvent.keyboard('{Enter}')

		await expect
			.element(location())
			.toHaveTextContent('?status=pending&q=RCI-7K')
	})

	it('drops the search once the box is emptied', async () => {
		renderToolbar('/orders?q=abc')

		await userEvent.clear(page.getByRole('searchbox', { name: 'Rechercher' }))
		await userEvent.keyboard('{Enter}')

		await expect.element(location()).toHaveTextContent(/^$/)
	})
})
