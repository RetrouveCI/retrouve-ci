import { createRoutesStub, useSearchParams } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { usePostsFilters } from '../use-posts-filters'

const PHRASE = "j'ai perdu ma carte d'identité à Cocody mardi"
const DEBOUNCE = 350

function Harness() {
	const filters = usePostsFilters({ total: 0, pageSize: 12 })
	const [params] = useSearchParams()

	return (
		<div>
			<label htmlFor="q">Recherche</label>
			<input
				id="q"
				value={filters.searchQuery}
				onChange={event => filters.setSearchQuery(event.target.value)}
			/>
			<button type="button" onClick={() => filters.setActiveTab('lost')}>
				Perdus
			</button>
			<button type="button" onClick={filters.dismissAssistant}>
				Masquer
			</button>
			<output>{params.toString()}</output>
		</div>
	)
}

function mount(search: string) {
	const Stub = createRoutesStub([{ path: '/posts', Component: Harness }])

	render(<Stub initialEntries={[`/posts${search}`]} />)
}

/** `<output>` carries the status role; a raw read does not retry, so it waits. */
async function url(): Promise<URLSearchParams> {
	const printed = page.getByRole('status')
	await expect.element(printed).toBeInTheDocument()

	return new URLSearchParams(printed.element().textContent ?? '')
}

afterEach(() => cleanup())

describe('the posts filters and the assistant', () => {
	it('still debounces a keyword into the URL', async () => {
		mount('')
		await userEvent.fill(page.getByLabelText('Recherche'), 'carte')

		await vi.waitFor(async () => expect((await url()).get('q')).toBe('carte'))
	})

	/**
	 * Filtering « j'ai perdu ma carte d'identité à Cocody mardi » word by word
	 * empties the list long before the sentence is finished, and Enter would then
	 * be fixing a list the visitor had already watched go blank.
	 */
	it('holds the live filter still while a phrase is being written', async () => {
		mount('')
		await userEvent.fill(page.getByLabelText('Recherche'), PHRASE)
		await new Promise(resolve => setTimeout(resolve, DEBOUNCE * 3))

		expect((await url()).get('q')).toBeNull()
	})

	it.each([
		['a filter is touched by hand', 'Perdus'],
		['the banner is dismissed', 'Masquer'],
	])('drops the assistant markers when %s', async (_, label) => {
		mount(`?assistant=empty&phrase=${encodeURIComponent(PHRASE)}`)
		expect((await url()).get('assistant')).toBe('empty')

		await page.getByRole('button', { name: label }).click()

		await vi.waitFor(async () => {
			const params = await url()

			expect(params.get('assistant')).toBeNull()
			expect(params.get('phrase')).toBeNull()
		})
	})
})
