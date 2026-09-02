import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * A second, tiny build for the one file `react-router build` cannot emit: a
 * worker is a stand-alone script at the scope root, not a chunk of the route
 * graph. In TypeScript beside the app, its policy is typed, linted and
 * unit-testable (§ R24). Runs **after** the app build, which empties `build/`.
 */
export default defineConfig({
	plugins: [tsconfigPaths()],
	build: {
		outDir: 'build/client',
		emptyOutDir: false,
		copyPublicDir: false,
		// Every browser that implements service workers is well past this.
		target: 'es2020',
		rollupOptions: {
			input: 'app/sw/service-worker.ts',
			output: {
				entryFileNames: 'sw.js',
				format: 'iife',
				inlineDynamicImports: true,
			},
		},
	},
})
