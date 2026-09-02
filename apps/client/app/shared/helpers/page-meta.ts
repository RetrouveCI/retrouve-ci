export const SITE_NAME = 'RetrouveCI'
export const OG_LOCALE = 'fr_CI'

/** 1200×630, the ratio WhatsApp and Facebook crop to. `logo.png` was a portrait. */
export const OG_IMAGE = '/og-image.png'

export interface PageMetaOptions {
	/** Page name alone — the site name is appended. */
	title: string
	description?: string
	image?: string
	type?: 'website' | 'article'
}

export function pageMeta({
	title,
	description,
	image = OG_IMAGE,
	type = 'website',
}: PageMetaOptions) {
	const documentTitle = `${title} | ${SITE_NAME}`

	return [
		{ title: documentTitle },
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
