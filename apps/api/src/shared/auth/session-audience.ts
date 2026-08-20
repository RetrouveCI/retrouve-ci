export type SessionAudience = 'admin' | 'public'

export const AUDIENCE_HEADER = 'x-auth-audience'

const DEFAULT_ADMIN_ORIGINS = ['http://localhost:3001']

export function getAdminOrigins(
	env: NodeJS.ProcessEnv = process.env,
): string[] {
	const configured = env['ADMIN_ORIGINS']
		?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)

	if (configured?.length) return configured

	if (env['NODE_ENV'] === 'production') {
		throw new Error(
			'ADMIN_ORIGINS must list the backoffice origins in production, so the API can tell the two apps apart.',
		)
	}

	return DEFAULT_ADMIN_ORIGINS
}

interface AudienceInput {
	origin: string | undefined
	audienceHeader: string | undefined
	adminOrigins: string[]
}

/**
 * `Origin` wins whenever it is there: the browser sets it and a page can neither
 * forge nor remove it, so an injected script cannot claim the other audience.
 * The header only answers server-side calls, which carry no `Origin` and come
 * from our own front-ends.
 */
export function resolveAudience({
	origin,
	audienceHeader,
	adminOrigins,
}: AudienceInput): SessionAudience {
	if (origin) return adminOrigins.includes(origin) ? 'admin' : 'public'

	return audienceHeader === 'admin' ? 'admin' : 'public'
}
