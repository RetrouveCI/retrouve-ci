/**
 * The pages a crawler may index. `changefreq` and `priority` are left out on
 * purpose: Google ignores both.
 */
export const INDEXABLE_PATHS = [
	'/',
	'/posts',
	'/objet-perdu-cote-divoire',
	'/carte-identite-perdue',
	'/publish',
	'/stickers',
	'/stickers/order',
	'/about',
	'/contact',
	'/download',
	'/terms',
	'/privacy',
] as const

/**
 * ⚠️ `/q/` matters beyond crawl budget: a sticker page carries its owner's first
 * name and their label. These pages also send `noindex` — robots.txt stops a
 * crawl, not an indexing.
 */
export const DISALLOWED_PATHS = [
	'/account',
	'/notifications',
	'/publish/lost',
	'/publish/found',
	'/scan',
	'/q/',
	'/login',
	'/register',
	'/password-forgotten',
	'/reset-password',
	'/offline',
] as const

/**
 * The public pages a static list cannot name, because their path carries a
 * parameter: the sitemap enumerates them one by one instead. This is the third
 * class of the partition every mounted page falls into — indexable, disallowed,
 * or enumerated — and naming it is what lets the guard be total.
 */
export const ENUMERATED_PATHS = ['/posts/:id'] as const

// Capped so a crawler's fetch stays bounded: 100 is `MAX_PAGE_SIZE`, and ten
// calls is far more than the pilot holds.
export const SITEMAP_PAGE_SIZE = 100
export const SITEMAP_MAX_PAGES = 10
