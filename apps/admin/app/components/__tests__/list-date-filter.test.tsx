import { createRoutesStub, useLocation } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { ListDateFilter } from '../list-date-filter'

function Location() {
	return <p data-testid="location">{useLocation().search}</p>
}

function renderFilter(entry = '/orders') {
	const Stub = createRoutesStub([
		{
			path: '/orders',
			Component: () => (
				<>
					<ListDateFilter />
					<Location />
				</>
			),
		},
	])

	render(<Stub initialEntries={[entry]} />)
}

/** A raw DOM read does not retry, so the mount is awaited through a locator. */
async function search(): Promise<URLSearchParams> {
	const printed = page.getByTestId('location')
	await expect.element(printed).toBeInTheDocument()

	return new URLSearchParams(printed.element().textContent ?? '')
}

/**
 * Waiting for the element is not waiting for the **navigation**: the location
 * paragraph is on screen from the first render, so reading it right after a
 * click reads the URL from before. Measured — it passed alone and failed under
 * a full-suite run, which is the same race by another name.
 */
async function settledSearch(
	holds: (params: URLSearchParams) => boolean,
): Promise<URLSearchParams> {
	let params = new URLSearchParams()

	await vi.waitFor(async () => {
		params = await search()
		expect(holds(params)).toBe(true)
	})

	return params
}

const period = () => page.getByRole('combobox')

afterEach(() => cleanup())

describe('ListDateFilter', () => {
	it('writes the period into the URL, in the contracts’ spelling', async () => {
		renderFilter()

		await period().click()
		await page.getByRole('option', { name: '30 derniers jours' }).click()

		const params = await settledSearch(next => next.has('dateFrom'))

		expect(params.get('dateFrom')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
		expect(params.get('dateTo')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})

	// Every filter has done this since F9a: a narrower list has fewer pages, and
	// staying on page 7 would show an empty one.
	it('returns to the first page', async () => {
		renderFilter('/orders?page=7&q=abc')

		await period().click()
		await page.getByRole('option', { name: '7 derniers jours' }).click()

		const params = await settledSearch(next => next.has('dateFrom'))

		expect(params.get('page')).toBeNull()
		expect(params.get('q')).toBe('abc')
	})

	it('clears both bounds on « Toute période »', async () => {
		renderFilter('/orders?dateFrom=2026-09-01&dateTo=2026-09-15')

		await period().click()
		await page.getByRole('option', { name: 'Toute période' }).click()

		const params = await settledSearch(next => !next.has('dateFrom'))

		expect(params.get('dateFrom')).toBeNull()
		expect(params.get('dateTo')).toBeNull()
	})

	/**
	 * The range comes from the URL, so on a reload the select used to say
	 * « Toute période » beside a button showing two dates — the control
	 * contradicting itself.
	 */
	it('does not claim « Toute période » while a range is set', async () => {
		renderFilter('/orders?dateFrom=2026-09-01&dateTo=2026-09-15')

		await expect.element(period()).toBeInTheDocument()

		expect(period().element().textContent).not.toContain('Toute période')
	})
})
