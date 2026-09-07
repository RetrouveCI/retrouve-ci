import { requestOrigin } from '@/shared/helpers/origin'
import { getLostItems } from '../../posts/servers/lost-items.service'
import {
	INDEXABLE_PATHS,
	SITEMAP_MAX_PAGES,
	SITEMAP_PAGE_SIZE,
} from '../seo.const'

const CACHE = 'public, max-age=3600'

export interface SitemapEntry {
	path: string
	lastModified?: string
}

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

export function buildSitemap(origin: string, entries: SitemapEntry[]): string {
	const urls = entries.map(({ path, lastModified }) => {
		const lastmod = lastModified
			? `\n\t\t<lastmod>${escapeXml(lastModified.slice(0, 10))}</lastmod>`
			: ''

		return `\t<url>\n\t\t<loc>${escapeXml(`${origin}${path}`)}</loc>${lastmod}\n\t</url>`
	})

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/**
 * What the sitemap is for: without it Google reaches a listing only by crawling
 * the pagination of `/posts`. The public list applies `published` server-side,
 * so nothing hidden appears here. A failure yields the static paths alone — a
 * 500 teaches a crawler nothing.
 */
async function listingEntries(request: Request): Promise<SitemapEntry[]> {
	const entries: SitemapEntry[] = []

	try {
		for (let page = 1; page <= SITEMAP_MAX_PAGES; page++) {
			const { items, total } = await getLostItems(
				{ page, pageSize: SITEMAP_PAGE_SIZE },
				request,
			)

			entries.push(
				...items.map(item => ({
					path: `/posts/${item.id}`,
					lastModified: item.createdAt,
				})),
			)

			if (entries.length >= total || !items.length) break
		}
	} catch {
		return []
	}

	return entries
}

export async function loader({ request }: { request: Request }) {
	const entries: SitemapEntry[] = [
		...INDEXABLE_PATHS.map(path => ({ path })),
		...(await listingEntries(request)),
	]

	return new Response(buildSitemap(requestOrigin(request), entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': CACHE,
		},
	})
}
