import { z } from 'zod'
import { calendarDateSchema } from '../shared/calendar-date'
import { paginationQuerySchema } from '../shared/pagination'
import {
	lostItemCategorySchema,
	lostItemTypeSchema,
	moderationStatusSchema,
} from './enums.schema'

export const listLostItemsFilterSchema = paginationQuerySchema.extend({
	type: lostItemTypeSchema.optional(),
	category: lostItemCategorySchema.optional(),
	ville: z.string().trim().optional(),
	commune: z.string().trim().optional(),
	search: z.string().trim().optional(),
	dateFrom: calendarDateSchema({
		required: 'Date de début requise',
		invalid: 'Date de début invalide',
	}).optional(),
	dateTo: calendarDateSchema({
		required: 'Date de fin requise',
		invalid: 'Date de fin invalide',
	}).optional(),
})

export const adminListLostItemsFilterSchema = listLostItemsFilterSchema.extend({
	moderationStatus: moderationStatusSchema.optional(),
})

export type ListLostItemsFilterInput = z.input<typeof listLostItemsFilterSchema>
export type ListLostItemsFilterData = z.output<typeof listLostItemsFilterSchema>
export type AdminListLostItemsFilterInput = z.input<
	typeof adminListLostItemsFilterSchema
>
export type AdminListLostItemsFilterData = z.output<
	typeof adminListLostItemsFilterSchema
>
