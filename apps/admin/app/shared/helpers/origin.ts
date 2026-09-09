function firstHop(request: Request, header: string): string | undefined {
	return request.headers.get(header)?.split(',')[0]?.trim() || undefined
}

/**
 * This app's origin as the browser saw it, for the `Origin` header a
 * server-side call to better-auth carries. Not `new URL(request.url).origin`:
 * `react-router-serve` sets no `trust proxy`, so that reads `http` behind
 * Traefik, which better-auth refuses against a trusted `https://` origin.
 * Forwarding the browser's own also leaves that check able to fail at all.
 */
export function requestOrigin(request: Request): string {
	const sent = request.headers.get('origin')
	if (sent && sent !== 'null') return sent

	const url = new URL(request.url)
	const protocol =
		firstHop(request, 'x-forwarded-proto') ?? url.protocol.slice(0, -1)
	const host = firstHop(request, 'x-forwarded-host') ?? url.host

	return `${protocol}://${host}`
}
