import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from '@retrouve-ci/vitest-config/base'

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			environment: 'node',
			root: './',
			include: ['src/**/*.spec.ts'],
		},
	}),
)
