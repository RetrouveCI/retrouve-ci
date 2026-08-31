import { useSearchParams, createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import { usePostsFilters } from '../../hooks/use-posts-filters'
import { PaginationBar } from '../pagination-bar'

const PAGE_SIZE = 12
// 40 pages: the count the plan's « 1 … 7 8 9 … 40 » is written against.
const TOTAL = PAGE_SIZE * 40

/**
 * The bar and the hook are one behaviour — the bar writes nothing itself, it
 * moves `page` through the hook — so they are exercised together over the real
 * `useSearchParams`.
 */
function Harness() {
	const [searchParams] = useSearchParams()
	const f = usePostsFilters({ total: TOTAL, pageSize: PAGE_SIZE })

	return (
		<>
			<p data-testid="url">{searchParams.toString()}</p>
			<PaginationBar
				currentPage={f.currentPage}
				totalPages={f.totalPages}
				onPageChange={f.setCurrentPage}
			/>
		</>
	)
}

function renderAt(search = '') {
	const Stub = createRoutesStub([{ path: '/posts', Component: Harness }])
	render(<Stub initialEntries={[`/posts${search}`]} />)
}

const url = () => page.getByTestId('url')
const pageButton = (n: number) =>
	page.getByRole('button', { name: `Page ${n}` })

beforeEach(stopAnimations)
afterEach(cleanup)

describe('the pagination is a window, not one button per page', () => {
	it('draws the ends, the current page and its neighbours — and nothing else', async () => {
		renderAt('?page=8')

		for (const n of [1, 7, 8, 9, 40])
			await expect.element(pageButton(n)).toBeVisible()

		// 40 pages used to mean 40 buttons. These are the ones that must be gone.
		for (const n of [2, 6, 10, 20, 39])
			await expect.element(pageButton(n)).not.toBeInTheDocument()
	})

	it('puts each page in the document once, at whichever breakpoints show it', async () => {
		renderAt('?page=8')
		await expect.element(pageButton(8)).toBeVisible()

		// Both windows come from one list of slots. Rendering them as two lists
		// would name « Page 8 » twice, and a screen reader would find both.
		expect(pageButton(8).elements()).toHaveLength(1)
		expect(pageButton(7).elements()).toHaveLength(1)

		// `1 … 8 … 40` on a phone: the neighbours are the slots CSS drops, and the
		// current page is never one of them.
		const slotOf = (n: number) =>
			document.querySelector(`[aria-label="Page ${n}"]`)!.closest('li')!
				.className
		expect(slotOf(7)).toContain('max-sm:hidden')
		expect(slotOf(9)).toContain('max-sm:hidden')
		for (const n of [1, 8, 40]) expect(slotOf(n)).not.toContain('max-sm:hidden')
	})

	it('marks the page it is on', async () => {
		renderAt('?page=8')

		await expect.element(pageButton(8)).toHaveAttribute('aria-current', 'page')
		await expect.element(pageButton(7)).not.toHaveAttribute('aria-current')
	})
})

describe('the bar moves the URL, which is what re-runs the loader', () => {
	it('writes the page it jumps to', async () => {
		renderAt('?page=8')

		await userEvent.click(pageButton(40))
		await expect.element(url()).toHaveTextContent('page=40')
	})

	it('drops the param on the way back to page 1, rather than writing page=1', async () => {
		renderAt('?page=8')

		await userEvent.click(pageButton(1))
		await expect.element(url()).not.toHaveTextContent('page')
	})

	it('keeps the filters it was paging through', async () => {
		renderAt('?ville=Abidjan&page=8')

		await userEvent.click(page.getByRole('button', { name: 'Page suivante' }))

		await expect.element(url()).toHaveTextContent('ville=Abidjan')
		await expect.element(url()).toHaveTextContent('page=9')
	})

	it.each([
		['Page précédente', '', 'Page suivante'],
		['Page suivante', '?page=40', 'Page précédente'],
	])(
		'disables « %s » at the end it cannot leave',
		async (blocked, search, open) => {
			renderAt(search)

			await expect
				.element(page.getByRole('button', { name: blocked }))
				.toBeDisabled()
			await expect
				.element(page.getByRole('button', { name: open }))
				.toBeEnabled()
		},
	)
})

describe('a listing that fits on one page', () => {
	it('draws no bar at all', () => {
		function OnePage() {
			const f = usePostsFilters({ total: 5, pageSize: PAGE_SIZE })
			return (
				<PaginationBar
					currentPage={f.currentPage}
					totalPages={f.totalPages}
					onPageChange={f.setCurrentPage}
				/>
			)
		}
		const Stub = createRoutesStub([{ path: '/posts', Component: OnePage }])
		render(<Stub initialEntries={['/posts']} />)

		expect(document.querySelector('nav[aria-label="Pagination"]')).toBeNull()
	})
})
