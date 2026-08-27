import { getAllowedOrigins } from './allowed-origins'

function hostOf(url: string | undefined): string | undefined {
	if (!url) return undefined

	try {
		return new URL(url).hostname
	} catch {
		return undefined
	}
}

/**
 * Parent domain for the session cookie. Host-only, a front on a sibling
 * subdomain never receives it, so every server-side session check sees an
 * anonymous request. Pointless when every host already matches.
 */
export function getCookieDomain(
	env: NodeJS.ProcessEnv = process.env,
): string | undefined {
	const configured = env['COOKIE_DOMAIN']?.trim()

	if (configured) return configured

	const apiHost = hostOf(env['BETTER_AUTH_URL'])
	const frontHosts = getAllowedOrigins(env)
		.map(hostOf)
		.filter((host): host is string => Boolean(host))

	const crossHost = frontHosts.some(host => host !== apiHost)

	if (env['NODE_ENV'] === 'production' && apiHost && crossHost) {
		throw new Error(
			`COOKIE_DOMAIN is required when the API (${apiHost}) and the front-ends (${frontHosts.join(', ')}) are on different hosts: the session cookie would stay host-only on the API, so no front could read it. Set the shared parent domain, e.g. ".example.com".`,
		)
	}

	return undefined
}
