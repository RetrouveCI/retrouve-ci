import react from '@vitejs/plugin-react'
import { mergeConfig, defineConfig } from 'vitest/config'
import { baseConfig } from './base'

/**
 * Configuration Vitest pour les apps/packages React (jsdom + Testing Library).
 */
export const reactConfig = mergeConfig(
	baseConfig,
	defineConfig({
		plugins: [react()],
		test: {
			environment: 'jsdom',
			globals: true,
		},
	}),
)
