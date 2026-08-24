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
 * The parent domain the session cookie is set on, e.g. `.retrouveci.com`.
 *
 * Without it the cookie is host-only on the API's hostname. A front served from
 * a sibling subdomain then never receives it, and since a loader can only
 * forward the cookies the browser sent to **its own** origin, every server-side
 * session check sees an anonymous request — the sign-in succeeds, the redirect
 * bounces straight back to the login page.
 *
 * It works on localhost with no value at all, because cookies ignore the port:
 * `localhost:3001` and `localhost:3002` share one cookie host. That is why this
 * only ever broke in production.
 *
 * So it is **required** in production as soon as the API and the fronts are on
 * different hosts, and pointless when they are not.
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
