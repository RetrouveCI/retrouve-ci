const DEFAULT_ALLOWED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:3001',
]

/**
 * The origins the two front-ends are served from. **One** list drives both CORS
 * and better-auth's `trustedOrigins`, because they answer the same question —
 * keeping two variables in step is how production ended up allowing neither, and
 * every browser call failed while the API looked perfectly healthy.
 *
 * Required in production, like `ADMIN_ORIGINS`: an API no browser may call is
 * not serving anyone, so it says so at boot instead of at every request.
 */
export function getAllowedOrigins(
	env: NodeJS.ProcessEnv = process.env,
): string[] {
	const configured = env['ALLOWED_ORIGINS']
		?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)

	if (configured?.length) return configured

	if (env['NODE_ENV'] === 'production') {
		throw new Error(
			'ALLOWED_ORIGINS must list the front-end origins in production: without it CORS allows nothing and better-auth trusts nothing, so every browser call fails.',
		)
	}

	return DEFAULT_ALLOWED_ORIGINS
}
