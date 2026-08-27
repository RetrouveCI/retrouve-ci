import { useMatches } from 'react-router'

export interface BreadcrumbItem {
	label: string
	to: string
}

/**
 * Route `handle` contract used by the dashboard shell to render the page
 * title and breadcrumb in the top bar. Each route exports:
 *
 *   export const handle: RouteHandle = { title: 'Posts' }
 *
 * `title` may be a function to derive the label from the route's loader data
 * (e.g. an entity name), and `breadcrumb` lists parent crumbs for deep routes.
 */
export interface RouteHandle {
	title?: string | ((data: unknown) => string)
	breadcrumb?: BreadcrumbItem[]
}

export interface PageMeta {
	title: string
	breadcrumb: BreadcrumbItem[]
}

interface RouteMatchLike {
	handle?: unknown
	data?: unknown
}

/**
 * Walks the matched routes from the deepest up and returns the title +
 * breadcrumb declared by the closest route exposing a `handle.title`.
 */
export function resolveRouteMeta(
	matches: ReadonlyArray<RouteMatchLike | undefined>,
): PageMeta {
	for (let i = matches.length - 1; i >= 0; i--) {
		const match = matches[i]
		const handle = match?.handle as RouteHandle | undefined
		if (!handle?.title) continue
		const title =
			typeof handle.title === 'function'
				? handle.title(match?.data)
				: handle.title
		return { title, breadcrumb: handle.breadcrumb ?? [] }
	}
	return { title: '', breadcrumb: [] }
}

export function usePageMeta(): PageMeta {
	return resolveRouteMeta(useMatches())
}
