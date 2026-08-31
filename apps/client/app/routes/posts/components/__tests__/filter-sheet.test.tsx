import { useSearchParams } from 'react-router'
import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import { presetDateFrom } from '../../helpers/date-presets'
import { usePostsFilters } from '../../hooks/use-posts-filters'
import { FilterSheet } from '../filter-sheet'

const TOTAL = 38

/**
 * The sheet and the hook are one behaviour — the sheet writes nothing itself,
 * it drives the URL through the hook — so they are exercised together, over the
 * real `useSearchParams`.
 */
function Harness() {
	const [searchParams] = useSearchParams()
	const f = usePostsFilters({ total: TOTAL, pageSize: 12 })

	return (
		<>
			<button type="button" onClick={f.openFilterSheet}>
				Filtres
			</button>
			<p data-testid="url">{searchParams.toString()}</p>
			<div data-testid="results" style={{ height: 900 }}>
				Résultats
			</div>
			<FilterSheet
				open={f.isFilterSheetOpen}
				onOpenChange={f.setFilterSheetOpen}
				activeType={f.activeTab}
				activeCategory={f.activeCategory}
				filterVille={f.filterVille}
				filterCommune={f.filterCommune}
				dateFilter={f.dateFilter}
				dateRange={f.dateRange}
				hasActiveFilters={f.hasActiveFilters}
				resultCount={TOTAL}
				onTypeChange={f.setActiveTab}
				onCategoryChange={f.setActiveCategory}
				onVilleChange={f.setFilterVille}
				onCommuneChange={f.setFilterCommune}
				onDateFilterChange={f.setDateFilter}
				onDateRangeChange={f.setDateRange}
				onReset={f.resetFilters}
				onCancel={f.cancelFilters}
			/>
		</>
	)
}

function renderAt(search = '') {
	const Stub = createRoutesStub([{ path: '/posts', Component: Harness }])
	render(<Stub initialEntries={[`/posts${search}`]} />)
}

const url = () => page.getByTestId('url')
const openSheet = () =>
	userEvent.click(page.getByRole('button', { name: 'Filtres' }))

beforeEach(stopAnimations)
afterEach(cleanup)

describe('the filters open in a bottom sheet', () => {
	it('leaves the results exactly where they were — the panel used to push them down', async () => {
		renderAt()
		await expect.element(page.getByTestId('results')).toBeVisible()
		const before = document
			.querySelector('[data-testid="results"]')!
			.getBoundingClientRect().top

		await openSheet()
		await expect.element(page.getByRole('dialog')).toBeVisible()

		expect(
			document.querySelector('[data-testid="results"]')!.getBoundingClientRect()
				.top,
		).toBe(before)
	})

	it('names the count on the button that closes it', async () => {
		renderAt()
		await openSheet()

		const done = page.getByRole('button', { name: `Voir ${TOTAL} résultats` })
		await expect.element(done).toBeVisible()

		await userEvent.click(done)
		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
	})
})

describe('the five filters reach the URL', () => {
	it('writes the type the sheet selects', async () => {
		renderAt()
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Perdus' }))
		await expect.element(url()).toHaveTextContent('type=lost')
	})

	it('writes the category the sheet selects', async () => {
		renderAt()
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Clés' }))
		await expect.element(url()).toHaveTextContent('category=keys')
	})

	// `htmlFor` was missing on all three labels: the accessible name is the fix.
	it.each([
		['Ville', 'filter-ville'],
		['Commune', 'filter-commune'],
	])('binds the « %s » label to its control', async (label, id) => {
		renderAt()
		await openSheet()

		await expect.element(page.getByLabelText(label)).toHaveAttribute('id', id)
	})

	it('turns a period preset into a dateFrom the loader can read', async () => {
		renderAt()
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: '7 jours' }))
		await expect
			.element(url())
			.toHaveTextContent(`dateFrom=${presetDateFrom('7d')}`)
	})

	it('clears the period with « Tout »', async () => {
		renderAt(`?dateFrom=${presetDateFrom('30d')}`)
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Tout' }))
		await expect.element(url()).not.toHaveTextContent('dateFrom')
	})
})

describe('the two ways out of the sheet', () => {
	it('« Annuler » puts back the URL the sheet opened on', async () => {
		renderAt('?type=found')
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Perdus' }))
		await expect.element(url()).toHaveTextContent('type=lost')

		await userEvent.click(page.getByRole('button', { name: 'Annuler' }))
		await expect.element(url()).toHaveTextContent('type=found')
	})

	it('« Voir N résultats » keeps what was chosen', async () => {
		renderAt()
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Perdus' }))
		await userEvent.click(
			page.getByRole('button', { name: `Voir ${TOTAL} résultats` }),
		)

		await expect.element(url()).toHaveTextContent('type=lost')
	})

	// It empties the sheet, so it covers the five groups the sheet draws.
	it('« Réinitialiser » clears every group at once', async () => {
		renderAt('?type=lost&category=keys&ville=Abidjan')
		await openSheet()

		await userEvent.click(page.getByRole('button', { name: 'Réinitialiser' }))

		await expect.element(url()).not.toHaveTextContent('type=lost')
		await expect.element(url()).not.toHaveTextContent('category=keys')
		await expect.element(url()).not.toHaveTextContent('ville=Abidjan')
	})
})
