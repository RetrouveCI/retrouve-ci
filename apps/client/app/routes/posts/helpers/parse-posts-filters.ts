import {
	listLostItemsFilterSchema,
	type ListLostItemsFilterData,
} from '@app/contracts/lost-items'

export const POSTS_PAGE_SIZE = 12

/** The one query key the URL spells differently from the contract. */
const ALIASES: Record<string, string> = { q: 'search' }

const FILTER_KEYS = [
	'q',
	'type',
	'category',
	'ville',
	'commune',
	'dateFrom',
	'dateTo',
	'page',
] as const

/**
 * A search param is whatever the visitor pasted into the address bar. Handing it
 * to the API unchecked turned `?category=test` into a 400, which the loader let
 * through as a full error page — a browsable listing lost to one bad character.
 *
 * So the contract decides: whatever it refuses is dropped and the filters around
 * it still apply, with `page` falling back to its documented default.
 */
export function parsePostsFilters(
	params: URLSearchParams,
): ListLostItemsFilterData {
	const candidate: Record<string, string> = {
		pageSize: String(POSTS_PAGE_SIZE),
	}

	for (const key of FILTER_KEYS) {
		const value = params.get(key)
		if (value !== null) candidate[ALIASES[key] ?? key] = value
	}

	const parsed = listLostItemsFilterSchema.safeParse(candidate)
	if (parsed.success) return parsed.data

	for (const issue of parsed.error.issues) {
		const field = issue.path[0]
		if (typeof field === 'string') delete candidate[field]
	}

	const retried = listLostItemsFilterSchema.safeParse(candidate)

	// Only the defaults can remain by now, but a future contract change must not
	// be able to bring the error page back.
	return retried.success ? retried.data : { page: 1, pageSize: POSTS_PAGE_SIZE }
}

/**
 * The date pickers and the active chips both `format()` whatever the URL holds,
 * and `format(new Date('pasunedate'))` throws `RangeError: Invalid time value`
 * — server-side, so the whole page renders as an error. The contract already
 * keeps a bad date out of the API call; this keeps it out of the render.
 */
export function toValidDate(value: string | null): Date | undefined {
	if (!value) return undefined

	const date = new Date(value)

	return Number.isNaN(date.getTime()) ? undefined : date
}
