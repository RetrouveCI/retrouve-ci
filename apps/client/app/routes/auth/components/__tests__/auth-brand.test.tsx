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
		renderIn(<BrandingPanel />)

		await expect.element(brandMark()).toHaveAttribute('src', '/logo.png')
	})
})
