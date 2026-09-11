import { LIST_SEARCH_MAX_LENGTH } from '@app/contracts/shared'

export const PAGE_SIZES = [10, 25, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 25

export interface ListPage {
	page: number
	pageSize: number
}

// The URL is hand-editable: an unreadable page reads as the first, an unknown
// size as the default, rather than as an error.
export function readListPage(params: URLSearchParams): ListPage {
	const page = Number(params.get('page'))
	const pageSize = PAGE_SIZES.find(
		size => size === Number(params.get('pageSize')),
	)

	return {
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		pageSize: pageSize ?? DEFAULT_PAGE_SIZE,
	}
}

export function readSearch(params: URLSearchParams): string | undefined {
	return params.get('q')?.trim().slice(0, LIST_SEARCH_MAX_LENGTH) || undefined
}

/** Where a page past the end of a list that shrank belongs, or `null`. */
export function pastLastPage(
	url: URL,
	{ page, pageSize }: ListPage,
	total: number,
): string | null {
	const last = Math.max(1, Math.ceil(total / pageSize))

	if (page <= last) return null

	const next = new URL(url)

	if (last > 1) next.searchParams.set('page', String(last))
	else next.searchParams.delete('page')

	return `${next.pathname}${next.search}`
}

/** The first page, the last, and the current one's neighbours. */
export function pageWindow(current: number, last: number): (number | 'gap')[] {
	const pages = [...new Set([1, current - 1, current, current + 1, last])]
		.filter(page => page >= 1 && page <= last)
		.sort((a, b) => a - b)

	return pages.flatMap((page, index) => {
		const previous = pages[index - 1]

		return previous !== undefined && page - previous > 1
			? (['gap', page] as const)
			: [page]
	})
}
