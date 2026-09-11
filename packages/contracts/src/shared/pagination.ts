import { z } from 'zod'

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Not `z.coerce`: its `z.input` is `unknown` in Zod 4. The union needs its own
// message, or it reports `Invalid input` in English.
const countable = z.union(
	[z.number().int(), z.string().regex(/^\d+$/).transform(Number)],
	{ error: 'Doit être un entier positif' },
)

export const paginationQuerySchema = z.object({
	page: countable
		.pipe(z.number().int().min(1, 'La page commence à 1'))
		.default(DEFAULT_PAGE),
	pageSize: countable
		.pipe(
			z
				.number()
				.int()
				.min(1, 'Demandez au moins un élément')
				.max(MAX_PAGE_SIZE, `Maximum ${MAX_PAGE_SIZE} éléments par page`),
		)
		.default(DEFAULT_PAGE_SIZE),
})

// A free-text filter on a list. Capped, since it reaches a `contains` on the API.
export const LIST_SEARCH_MAX_LENGTH = 100

export const listSearchSchema = z
	.string()
	.trim()
	.max(LIST_SEARCH_MAX_LENGTH, `Maximum ${LIST_SEARCH_MAX_LENGTH} caractères`)

export type PaginationQueryInput = z.input<typeof paginationQuerySchema>
export type PaginationQueryData = z.output<typeof paginationQuerySchema>

export interface Paginated<TItem> {
	items: TItem[]
	total: number
	page: number
	pageSize: number
}
