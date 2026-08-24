import type { PublicEnv } from '@/shared/helpers/env'

/**
 * Hands the runtime configuration to the browser. It renders **before**
 * `<Scripts />`, so an inline script beats the deferred module bundle and
 * `window.ENV` is set by the time `auth-client.ts` runs at module scope.
 */
export function PublicEnvScript({ env }: { env?: PublicEnv }) {
	if (!env) return null

	return (
		<script
			// `<` is escaped so a value can never close this tag early.
			dangerouslySetInnerHTML={{
				__html: `window.ENV=${JSON.stringify(env).replace(/</g, '\\u003c')}`,
			}}
		/>
	)
}
