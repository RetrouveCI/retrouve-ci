import { useState } from 'react'
import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { SearchBar } from '@/components/search-bar'
import { HeroSection } from '@/routes/home/components/hero-section'

const PHRASE = "j'ai perdu ma carte d'identité à Cocody mardi"

let submitted: { method: string; phrase: string | null } | null

/** The assistant's route, standing in for the one that spends money. */
function mount(children: React.ReactNode) {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <>{children}</> },
		{
			path: '/search',
			action: async ({ request }) => {
				const body = await request.formData()
				submitted = {
					method: request.method,
					phrase: body.get('phrase') as string | null,
				}
				return null
			},
		},
		{ path: '/posts', Component: () => <p>liste</p> },
	])

	render(<Stub initialEntries={['/']} />)
}

function FilterBar() {
	const [text, setText] = useState('')

	return (
		<SearchBar
			mode="filter"
			assistant
			value={text}
			onChange={setText}
			placeholder="Rechercher par objet, lieu..."
		/>
	)
}

beforeEach(() => {
	submitted = null
})

afterEach(() => cleanup())

describe('which search bars carry the assistant', () => {
	// The header is the third bar and deliberately does not: it is narrow, on
	// every page, and where « carte » gets typed in passing — spending five
	// phrases a quarter of an hour there would take them from whoever writes a
	// real one. `header-desktop.test.tsx` pins it to `GET /posts?q=`.
	it('sends the home hero’s sentence to the assistant', async () => {
		await page.viewport(390, 800)
		mount(<HeroSection />)

		await userEvent.fill(
			page.getByPlaceholder('Décrivez ce que vous avez perdu'),
			PHRASE,
		)
		// Enter rather than the button: `submit="responsive"` draws both the
		// worded one and the round one, and the stylesheet that hides one of them
		// is not loaded here — two matches, which is the trap §1.1 names.
		await userEvent.keyboard('{Enter}')

		await vi.waitFor(() => {
			expect(submitted).toEqual({ method: 'POST', phrase: PHRASE })
		})
	})

	it('names the field what the action reads', async () => {
		mount(<SearchBar mode="navigate" assistant submit="label" />)

		await userEvent.fill(page.getByRole('searchbox'), 'un deux trois quatre')
		await page.getByRole('button', { name: 'Rechercher' }).click()

		await vi.waitFor(() => {
			expect(submitted?.phrase).toBe('un deux trois quatre')
		})
	})

	// Enter is what did nothing at all on the filter bar before.
	it('says what Enter does, and only once it is a phrase', async () => {
		mount(<FilterBar />)
		const field = page.getByRole('searchbox')

		await userEvent.fill(field, 'carte')
		expect(page.getByText('Appuyez sur Entrée').elements().length).toBe(0)

		await userEvent.fill(field, PHRASE)
		await expect
			.element(page.getByText('Appuyez sur Entrée', { exact: false }))
			.toBeInTheDocument()
	})

	it('submits the filter bar’s phrase on Enter', async () => {
		mount(<FilterBar />)

		await userEvent.fill(page.getByRole('searchbox'), PHRASE)
		await userEvent.keyboard('{Enter}')

		await vi.waitFor(() => {
			expect(submitted).toEqual({ method: 'POST', phrase: PHRASE })
		})
	})
})
