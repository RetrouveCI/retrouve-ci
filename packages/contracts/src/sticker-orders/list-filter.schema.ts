import { z } from 'zod'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import { stickerOrderStatusSchema } from './status.schema'

export const listStickerOrdersFilterSchema = paginationQuerySchema.extend({
	search: listSearchSchema.optional(),
	status: stickerOrderStatusSchema.optional(),
})

export type ListStickerOrdersFilterInput = z.input<
	typeof listStickerOrdersFilterSchema
>
export type ListStickerOrdersFilterData = z.output<
	typeof listStickerOrdersFilterSchema
>
