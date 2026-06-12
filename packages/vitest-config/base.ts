import { defineConfig } from 'vitest/config'

/**
 * Configuration Vitest de base partagée par tous les workspaces RetrouveCI.
 * Seuil de couverture cible : 70% (lignes, fonctions, branches, statements).
 */
export const baseConfig = defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 70,
				statements: 70,
			},
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/.next/**',
				'**/*.config.*',
				'**/*.d.ts',
			],
		},
	},
})
