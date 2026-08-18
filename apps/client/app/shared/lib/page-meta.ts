export const SITE_NAME = 'RetrouveCI'
export const BRAND_COLOR = '#1E7F43'
export const OG_LOCALE = 'fr_CI'
export const OG_IMAGE = '/logo.png'

export interface PageMetaOptions {
	/** Page name alone — the site name is appended: `Annonces | RetrouveCI`. */
	title: string
	description?: string
	/** Defaults to the brand logo. */
	image?: string
	/** `article` for a single listing, `website` everywhere else. */
	type?: 'website' | 'article'
}

/**
 * Builds the whole document head for a page.
 *
 * React Router replaces a parent's `meta` with the child's rather than merging
 * the two, so a route returning only a title silently drops every `og:` and
 * `twitter:` tag declared in `root.tsx`. Going through this helper is what stops
 * that happening again — it is the reason pages do not hand-roll their `meta`.
 */
export function pageMeta({
	title,
	description,
	image = OG_IMAGE,
	type = 'website',
}: PageMetaOptions) {
	const documentTitle = `${title} | ${SITE_NAME}`

	return [
		{ title: documentTitle },
		{ name: 'theme-color', content: BRAND_COLOR },
		{ property: 'og:type', content: type },
		{ property: 'og:locale', content: OG_LOCALE },
		{ property: 'og:site_name', content: SITE_NAME },
		{ property: 'og:title', content: documentTitle },
		{ property: 'og:image', content: image },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: documentTitle },
		{ name: 'twitter:image', content: image },
		...(description
			? [
					{ name: 'description', content: description },
					{ property: 'og:description', content: description },
					{ name: 'twitter:description', content: description },
				]
			: []),
	]
}
