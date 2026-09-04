const PRODUCTION_HOPS = 1

/**
 * How many proxies sit in front of the API, which is what lets Fastify read a
 * client's real address out of `X-Forwarded-For`.
 *
 * A count, never `true`: trusting the header outright lets a caller invent its
 * address and walk around any limit keyed on one, and is what the two fastify
 * `X-Forwarded-*` advisories need. Too low is the other failure — one bucket
 * then holds every visitor, and the first abuser locks the rest out.
 */
export function getTrustProxyHops(
	env: NodeJS.ProcessEnv = process.env,
): number {
	const configured = env['TRUST_PROXY_HOPS']?.trim()

	if (configured) {
		const hops = Number(configured)

		if (!Number.isInteger(hops) || hops < 0) {
			throw new Error(
				`TRUST_PROXY_HOPS must be a non-negative integer, got "${configured}": it counts the proxies in front of the API, and a wrong count either shares one rate-limit bucket between every visitor or trusts an address the client can forge.`,
			)
		}

		return hops
	}

	return env['NODE_ENV'] === 'production' ? PRODUCTION_HOPS : 0
}
