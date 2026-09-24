import { z } from 'zod'
import { dateRangeFields } from '../shared/calendar-date'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import {
	lostItemCategorySchema,
	lostItemTypeSchema,
	moderationStatusSchema,
	resolutionStatusSchema,
} from './enums.schema'

export const listLostItemsFilterSchema = paginationQuerySchema.extend({
	type: lostItemTypeSchema.optional(),
	category: lostItemCategorySchema.optional(),
	ville: z.string().trim().optional(),
	commune: z.string().trim().optional(),
	search: listSearchSchema.optional(),
	...dateRangeFields(),
})

export const adminListLostItemsFilterSchema = listLostItemsFilterSchema.extend({
	moderationStatus: moderationStatusSchema.optional(),
})

/**
 * `/lost-items/mine`. The lifecycle axis is the owner's alone — the public
 * listing shows every published item whatever its resolution.
 */
export const myLostItemsFilterSchema = listLostItemsFilterSchema.extend({
	resolutionStatus: resolutionStatusSchema.optional(),
})

export type ListLostItemsFilterInput = z.input<typeof listLostItemsFilterSchema>
export type ListLostItemsFilterData = z.output<typeof listLostItemsFilterSchema>
export type AdminListLostItemsFilterInput = z.input<
	typeof adminListLostItemsFilterSchema
>
export type AdminListLostItemsFilterData = z.output<
	typeof adminListLostItemsFilterSchema
>
export type MyLostItemsFilterInput = z.input<typeof myLostItemsFilterSchema>
export type MyLostItemsFilterData = z.output<typeof myLostItemsFilterSchema>
