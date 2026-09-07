import { requestOrigin } from '@/shared/helpers/origin'
import { DISALLOWED_PATHS } from '../seo.const'

const CACHE = 'public, max-age=3600'

// Served rather than static so the `Sitemap:` line names the origin the browser
// used: `request.url` reads `http` behind Traefik (#198).
export function buildRobots(origin: string): string {
	return [
		'User-agent: *',
		'Allow: /',
		...DISALLOWED_PATHS.map(path => `Disallow: ${path}`),
		'',
		`Sitemap: ${origin}/sitemap.xml`,
		'',
	].join('\n')
}

export function loader({ request }: { request: Request }) {
	return new Response(buildRobots(requestOrigin(request)), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': CACHE,
		},
	})
}
