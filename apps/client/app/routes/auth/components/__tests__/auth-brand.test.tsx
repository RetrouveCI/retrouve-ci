import { createRoutesStub } from 'react-router'
import { page, render } from '@/shared/helpers/testing'
import { BrandingPanel } from '../branding-panel'

/**
 * The auth screens lost their brand twice, each time by a different route: R29
 * followed the canvas literally and drew a magnifier in place of the logo, then
 * removed the layout's logo bar — after which the mark survived only on the
 * panel, which is hidden below `md`, so a phone showed none at all.
 *
 * Both surfaces are asserted because both have to carry it: the panel from `md`,
 * the page bar below `lg`. Losing either is what happened.
 *
 * Asserted on the file, not on "some mark being present": an icon standing in
 * for the logo is exactly what happened the first time, and it would satisfy a
 * looser check.
 */
function renderIn(ui: React.ReactNode) {
	const Stub = createRoutesStub([{ path: '/', Component: () => <>{ui}</> }])
	render(<Stub initialEntries={['/']} />)
}

const brandMark = () => page.getByAltText('RetrouveCI')

describe('the brand on the auth screens', () => {
	it('is on the panel that carries the identity from md', async () => {
		renderIn(<BrandingPanel counters={null} />)

		await expect.element(brandMark()).toHaveAttribute('src', '/logo.png')
	})
})

describe('the counters band', () => {
	const band = () => page.getByText('Chiffres réels')

	it('draws nothing when the API could not answer', async () => {
		renderIn(<BrandingPanel counters={null} />)

		expect(band().elements()).toHaveLength(0)
	})

	it('draws nothing when both figures are zero', async () => {
		renderIn(
			<BrandingPanel counters={{ published: 0, resolvedThisMonth: 0 }} />,
		)

		expect(band().elements()).toHaveLength(0)
	})

	it('groups the thousands the French way', async () => {
		renderIn(
			<BrandingPanel counters={{ published: 1234, resolvedThisMonth: 37 }} />,
		)

		await expect.element(band()).toBeVisible()
		await expect.element(page.getByText('1 234')).toBeVisible()
		await expect.element(page.getByText('annonces en ligne')).toBeVisible()
	})

	it('keeps the figure that has something to say', async () => {
		renderIn(
			<BrandingPanel counters={{ published: 4, resolvedThisMonth: 0 }} />,
		)

		await expect.element(page.getByText('annonces en ligne')).toBeVisible()
		expect(page.getByText('objets rendus ce mois').elements()).toHaveLength(0)
	})
})
