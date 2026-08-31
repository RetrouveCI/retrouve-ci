import {
	myLostItemsFilterSchema,
	type MyLostItemsFilterData,
} from '@app/contracts/lost-items'

export const ACCOUNT_POSTS_PAGE_SIZE = 12

/** The two query keys the URL spells shorter than the contract. */
const ALIASES: Record<string, string> = {
	q: 'search',
	status: 'resolutionStatus',
}

const FILTER_KEYS = ['q', 'status', 'page'] as const

/**
 * « Mes annonces » filters the same way « Annonces » does — the URL is the
 * state, the API does the work. It used to ask for `?pageSize=50` and filter the
 * answer in a `useMemo`, so the 51st listing existed for nobody: not for the
 * list, not for the counters, not for the search.
 *
 * A search param is whatever the visitor left in the address bar, so the
 * contract decides: whatever it refuses is dropped and the filters around it
 * still apply, with `page` falling back to its documented default.
 */
export function parseAccountPostsFilters(
	params: URLSearchParams,
): MyLostItemsFilterData {
	const candidate: Record<string, string> = {
		pageSize: String(ACCOUNT_POSTS_PAGE_SIZE),
	}

	// An empty value is the filter being off, not a filter for the empty string:
	// `?q=` must parse the same as no `q` at all.
	for (const key of FILTER_KEYS) {
		const value = params.get(key)
		if (value) candidate[ALIASES[key] ?? key] = value
	}

	const parsed = myLostItemsFilterSchema.safeParse(candidate)
	if (parsed.success) return parsed.data

	for (const issue of parsed.error.issues) {
		const field = issue.path[0]
		if (typeof field === 'string') delete candidate[field]
	}

	const retried = myLostItemsFilterSchema.safeParse(candidate)

	// Only the defaults can remain by now, but a future contract change must not
	// be able to bring the error page back.
	return retried.success
		? retried.data
		: { page: 1, pageSize: ACCOUNT_POSTS_PAGE_SIZE }
}
