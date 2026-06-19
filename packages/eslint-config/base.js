import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	{
		plugins: {
			turbo: turboPlugin,
		},
		rules: {
			'turbo/no-undeclared-env-vars': [
				'warn',
				{
					// Vite compile-time builtins on `import.meta.env` — replaced at
					// build time, not real environment variables managed by Turborepo.
					allowList: ['^MODE$', '^BASE_URL$', '^PROD$', '^DEV$', '^SSR$'],
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					args: 'after-used',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
	{
		plugins: {
			onlyWarn,
		},
	},
	{
		ignores: ['dist/**'],
	},
]
