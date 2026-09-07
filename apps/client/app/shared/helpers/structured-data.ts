import { SITE_NAME } from './page-meta'

/**
 * The site's identity and its search box — `SearchAction` earns the sitelinks
 * searchbox, and `/posts` reads `q`. Nothing per page: no schema.org type
 * describes a lost-and-found listing, and `Article` would claim a genre.
 */
export function structuredData(origin: string): string {
	const data = [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: SITE_NAME,
			url: origin,
			inLanguage: 'fr-CI',
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${origin}/posts?q={search_term_string}`,
				},
				'query-input': 'required name=search_term_string',
			},
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: SITE_NAME,
			url: origin,
			logo: `${origin}/icon-512.png`,
			areaServed: { '@type': 'Country', name: "Côte d'Ivoire" },
		},
	]

	return JSON.stringify(data).replaceAll('<', '\\u003c')
}
