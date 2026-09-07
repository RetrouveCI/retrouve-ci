export const SITE_NAME = 'RetrouveCI'
export const OG_LOCALE = 'fr_CI'

/** 1200×630, the ratio WhatsApp and Facebook crop to. `logo.png` was a portrait. */
export const OG_IMAGE = '/og-image.png'

export interface PageMetaOptions {
	/** Page name alone — the site name is appended. */
	title: string
	description?: string
	type?: 'website' | 'article'
	/** robots.txt stops a crawl, never an indexing. This does. */
	noindex?: boolean
}

// The image tags live in `root`'s `Layout`: `og:image` must be absolute, which
// needs the request's origin. No caller passed a custom one, over all 28.
export function pageMeta({
	title,
	description,
	type = 'website',
	noindex,
}: PageMetaOptions) {
	const documentTitle = `${title} | ${SITE_NAME}`

	return [
		{ title: documentTitle },
		{ property: 'og:type', content: type },
		{ property: 'og:locale', content: OG_LOCALE },
		{ property: 'og:site_name', content: SITE_NAME },
		{ property: 'og:title', content: documentTitle },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: documentTitle },
		...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
		...(description
			? [
					{ name: 'description', content: description },
					{ property: 'og:description', content: description },
					{ name: 'twitter:description', content: description },
				]
			: []),
	]
}
