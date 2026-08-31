/**
 * Single entry point for component and hook tests, so no test imports the
 * runner's packages directly:
 *
 *   import { page, render, userEvent } from '@/shared/helpers/testing'
 *
 * `vitest/browser` provides `page` (the locator API) and `userEvent`;
 * `vitest-browser-react` provides `render`. Should a test ever need the app's
 * providers around the tree, wrap them here once rather than in every test.
 */
export * from 'vitest/browser'
export { cleanup, render } from 'vitest-browser-react'

const NO_MOTION_ID = 'test-no-motion'

/**
 * Playwright refuses to click an element whose box is still moving. A bottom
 * sheet's open transition outlives the click's own timeout as soon as the
 * machine is loaded — the two browser-mode suites running side by side is
 * enough — so the test fails on « element is not stable » and on nothing else.
 * Cutting every transition and animation makes those tests deterministic
 * without changing a single thing they assert.
 */
export function stopAnimations() {
	if (document.getElementById(NO_MOTION_ID)) return

	const style = document.createElement('style')
	style.id = NO_MOTION_ID
	style.textContent = `*, *::before, *::after {
		animation-duration: 0s !important;
		animation-delay: 0s !important;
		transition-duration: 0s !important;
		transition-delay: 0s !important;
	}`
	document.head.append(style)
}
