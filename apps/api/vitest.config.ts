import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from '@app/vitest-config/base'

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			environment: 'node',
			root: './',
			include: ['src/**/*.spec.ts'],
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	}),
)
