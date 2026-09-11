import { createRoutesStub, useLocation } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { ListPager } from '../list-pager'

function Location() {
	return <p data-testid="location">{useLocation().search}</p>
}

function renderPager(
	props: { page: number; pageSize: number; total: number },
	entry = '/orders',
) {
	const Stub = createRoutesStub([
		{
			path: '/orders',
			Component: () => (
				<>
					<ListPager {...props} />
					<Location />
				</>
			),
		},
	])

	render(<Stub initialEntries={[entry]} />)
}

const link = (name: string) => page.getByRole('link', { name, exact: true })

describe('ListPager', () => {
	it('says which rows it shows out of how many', async () => {
		renderPager({ page: 2, pageSize: 25, total: 60 })

		await expect.element(page.getByText(/26–50 sur 60/)).toBeInTheDocument()
	})

	it('links the next page, keeping the filters', async () => {
		renderPager(
			{ page: 2, pageSize: 25, total: 60 },
			'/orders?status=pending&page=2',
		)

		await expect
			.element(link('Page suivante'))
			.toHaveAttribute('href', '/orders?status=pending&page=3')
	})

	it('drops the page param for the first page', async () => {
		renderPager(
			{ page: 2, pageSize: 25, total: 60 },
			'/orders?status=pending&page=2',
		)

		await expect
			.element(link('Page 1'))
			.toHaveAttribute('href', '/orders?status=pending')
	})

	it('marks the current page', async () => {
		renderPager({ page: 2, pageSize: 25, total: 60 })

		await expect.element(link('Page 2')).toHaveAttribute('aria-current', 'page')
	})

	it('offers no way back from the first page, nor forward from the last', async () => {
		renderPager({ page: 1, pageSize: 25, total: 20 })

		await expect.element(link('Page 1')).toBeInTheDocument()
		expect(link('Page précédente').elements()).toHaveLength(0)
		expect(link('Page suivante').elements()).toHaveLength(0)
	})

	it('says an empty list holds nothing', async () => {
		renderPager({ page: 1, pageSize: 25, total: 0 })

		await expect.element(page.getByText(/0–0 sur 0/)).toBeInTheDocument()
	})

	it('returns to the first page when the size changes', async () => {
		renderPager({ page: 3, pageSize: 25, total: 200 }, '/orders?page=3')

		await userEvent.click(
			page.getByRole('combobox', { name: 'Lignes par page' }),
		)
		await userEvent.click(page.getByRole('option', { name: '50' }))

		await expect
			.element(page.getByTestId('location'))
			.toHaveTextContent('?pageSize=50')
	})
})
