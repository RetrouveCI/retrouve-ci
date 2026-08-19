import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		tailwindcss(),
		// `reactRouter()` builds the route-module graph and an SSR entry around
		// `routes.ts`, neither of which the browser test runner can mount. Tests
		// render components directly, inside a `createRoutesStub`, so the plugin is
		// left out under Vitest.
		...(process.env.VITEST ? [] : [reactRouter()]),
		tsconfigPaths(),
	],
	server: { port: 3000 },
	// Let Vite pre-bundle from the test files rather than discover dependencies
	// mid-run: the `@app/ui/components` barrel pulls in every Radix package, and
	// a discovery pass triggers a reload that can fail the run outright. Scanning
	// the entries up front keeps this self-maintaining as the barrel grows.
	optimizeDeps: { entries: ['app/**/*.test.tsx'] },
	test: {
		globals: true,
		projects: [
			{
				// Component and hook tests: run in a real browser, so Radix's pointer
				// events, focus handling and form submission behave as they do in the
				// app instead of needing jsdom shims.
				extends: true,
				test: {
					name: 'ui',
					include: ['app/**/*.test.tsx'],
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }],
					},
				},
			},
			{
				// Pure modules — helpers, mappers, schemas — with no DOM involved.
				extends: true,
				test: {
					name: 'node',
					include: ['app/**/*.test.ts'],
				},
			},
		],
	},
})
