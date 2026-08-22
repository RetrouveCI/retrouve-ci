export interface PageRequest {
	page: number
	pageSize: number
}

export interface Paginated<TItem> {
	items: TItem[]
	total: number
	page: number
	pageSize: number
}

/** Turns a one-based page request into the offset pair Prisma takes. */
export function toPrismaPage({ page, pageSize }: PageRequest): {
	skip: number
	take: number
} {
	return { skip: (page - 1) * pageSize, take: pageSize }
}

export function toPaginated<TItem>(
	items: TItem[],
	total: number,
	{ page, pageSize }: PageRequest,
): Paginated<TItem> {
	return { items, total, page, pageSize }
}
