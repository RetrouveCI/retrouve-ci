import { page, render } from '@/shared/helpers/testing'
import '../../app.css'

const EDGES = ['top', 'right', 'bottom', 'left'] as const

// Naming the cutouts once, as custom properties, is what makes them settable
// from a browser test, which can emulate a viewport but not a notch.
function wearACutout(size: string) {
	for (const edge of EDGES)
		document.documentElement.style.setProperty(`--safe-${edge}`, size)
}

function Screen() {
	return (
		<div className="safe-x">
			<div className="px-4">Contenu</div>
		</div>
	)
}

// The document is the runner's own and outlives the test.
afterEach(() => {
	for (const edge of EDGES)
		document.documentElement.style.removeProperty(`--safe-${edge}`)
})

describe('safe-x', () => {
	it('moves the content in by the cutout', async () => {
		wearACutout('44px')
		render(<Screen />)
		await expect.element(page.getByText('Contenu')).toBeInTheDocument()
		const gutter = page.getByText('Contenu').element().parentElement!

		expect(getComputedStyle(gutter).paddingLeft).toBe('44px')
		expect(getComputedStyle(gutter).paddingRight).toBe('44px')
	})

	it('costs nothing on a device with no cutout', async () => {
		render(<Screen />)
		await expect.element(page.getByText('Contenu')).toBeInTheDocument()
		const gutter = page.getByText('Contenu').element().parentElement!

		expect(getComputedStyle(gutter).paddingLeft).toBe('0px')
		expect(getComputedStyle(gutter).paddingRight).toBe('0px')
	})

	it('adds to the padding the screen already carries', async () => {
		wearACutout('44px')
		render(<Screen />)
		await expect.element(page.getByText('Contenu')).toBeInTheDocument()
		const inner = page.getByText('Contenu').element()
		const gutter = inner.parentElement!

		expect(inner.getBoundingClientRect().left).toBe(
			gutter.getBoundingClientRect().left + 44,
		)
		expect(getComputedStyle(inner).paddingLeft).toBe('16px')
	})
})
