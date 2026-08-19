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
