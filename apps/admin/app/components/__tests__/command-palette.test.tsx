import { createRoutesStub, useLocation } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { ThemeProvider } from '@/context/theme'
import type { PaletteHit } from '@/routes/dashboard/palette/types/palette.types'
import { CommandPalette } from '../command-palette'

function Location() {
	const { pathname, search } = useLocation()
	return <p data-testid="location">{`${pathname}${search}`}</p>
}

function renderPalette(hits: PaletteHit[] = [], palette = vi.fn()) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<>
					<CommandPalette />
					<Location />
				</>
			),
		},
		{
			path: '/palette',
			loader: ({ request }) => {
				palette()
				return { query: new URL(request.url).searchParams.get('q'), hits }
			},
		},
		{ path: '/posts', Component: Location },
		{ path: '/qr/:code', Component: Location },
	])

	render(
		<ThemeProvider initialTheme="light">
			<Stub initialEntries={['/']} />
		</ThemeProvider>,
	)
}

const opener = () =>
	page.getByRole('button', { name: 'Rechercher ou aller à…' })
const input = () => page.getByRole('combobox', { name: 'Rechercher' })
const location = () => page.getByTestId('location')

describe('CommandPalette', () => {
	it('opens from the top bar', async () => {
		renderPalette()

		await userEvent.click(opener())

		await expect.element(page.getByRole('dialog')).toBeVisible()
	})

	it('opens from Ctrl+K as well', async () => {
		renderPalette()

		await expect.element(opener()).toBeVisible()
		await userEvent.keyboard('{Control>}k{/Control}')

		await expect.element(page.getByRole('dialog')).toBeVisible()
	})

	it('goes to the page it matches', async () => {
		renderPalette()

		await userEvent.click(opener())
		await userEvent.fill(input(), 'annonces')
		await userEvent.click(page.getByRole('option', { name: 'Annonces' }))

		await expect.element(location()).toHaveTextContent('/posts')
	})

	/**
	 * « thème » is the one entry with no unaccented twin among the keywords, and
	 * that is what makes this a normalisation test at all. The events entry this
	 * replaces carried `evenements` as a keyword, so the query matched it raw:
	 * the case passed with `normalizeForSearch` removed entirely.
	 */
	it('finds an accented entry from an unaccented query', async () => {
		renderPalette()

		await userEvent.click(opener())
		await userEvent.fill(input(), 'theme')

		await expect
			.element(page.getByRole('option', { name: /Basculer le thème/ }))
			.toBeVisible()
	})

	it('lists what the API found under « Résultats », and opens it', async () => {
		renderPalette([
			{
				kind: 'sticker',
				id: 'RCI-7K2M4P',
				label: 'RCI-7K2M4P',
				detail: 'sticker · activé',
				to: '/qr/RCI-7K2M4P',
			},
		])

		await userEvent.click(opener())
		await userEvent.fill(input(), 'RCI-7K')

		await expect.element(page.getByText('Résultats')).toBeVisible()
		await userEvent.click(page.getByRole('option', { name: /RCI-7K2M4P/ }))

		await expect.element(location()).toHaveTextContent('/qr/RCI-7K2M4P')
	})

	it('says when nothing matches', async () => {
		renderPalette()

		await userEvent.click(opener())
		await userEvent.fill(input(), 'zzzz')

		await expect.element(page.getByText('Rien pour « zzzz »')).toBeVisible()
	})

	// A single letter would match half the base, four times over.
	it('does not ask the API for a single letter', async () => {
		const palette = vi.fn()
		renderPalette([], palette)

		await userEvent.click(opener())
		await userEvent.fill(input(), 'a')
		await new Promise(resolve => setTimeout(resolve, 400))

		expect(palette).not.toHaveBeenCalled()
	})
})
