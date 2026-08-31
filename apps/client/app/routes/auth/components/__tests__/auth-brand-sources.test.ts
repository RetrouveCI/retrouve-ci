import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A source check, deliberately, and only because the failure mode is literally
 * textual: twice now the brand was lost by someone replacing the `<img>` with a
 * drawn icon — first the canvas's magnifier on the panel, then nothing at all on
 * the bar once the layout's logo row was removed.
 *
 * The bar's mark lives in a `lg:hidden` branch, so a browser test at desktop
 * width cannot see it, and the runner has no phone-sized viewport. Rather than a
 * check that passes for the wrong reason, this asserts the one thing that
 * matters and cannot flake.
 */
const SURFACES = ['branding-panel.tsx', 'auth-page-header.tsx']

describe('the brand on the auth screens', () => {
	it.each(SURFACES)('%s shows the logo file, not a drawn icon', file => {
		const source = readFileSync(
			join(process.cwd(), 'app/routes/auth/components', file),
			'utf8',
		)

		expect(source).toContain('/logo.png')
	})
})
