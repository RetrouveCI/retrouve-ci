import { z } from 'zod'
import { dateRangeFields } from '../shared/calendar-date'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import { stickerOrderStatusSchema } from './status.schema'

/** The range bounds `createdAt`: when the order was placed, not when it moved. */
export const listStickerOrdersFilterSchema = paginationQuerySchema.extend({
	search: listSearchSchema.optional(),
	status: stickerOrderStatusSchema.optional(),
	...dateRangeFields(),
})

export type ListStickerOrdersFilterInput = z.input<
	typeof listStickerOrdersFilterSchema
>
export type ListStickerOrdersFilterData = z.output<
	typeof listStickerOrdersFilterSchema
>
