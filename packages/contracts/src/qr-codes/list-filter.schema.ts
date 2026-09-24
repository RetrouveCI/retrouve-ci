import { z } from 'zod'
import { dateRangeFields } from '../shared/calendar-date'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import { qrTokenStatusSchema } from './status.schema'

/** The range bounds `createdAt`: when the sticker was minted, not activated. */
export const listQrTokensFilterSchema = paginationQuerySchema.extend({
	search: listSearchSchema.optional(),
	status: qrTokenStatusSchema.optional(),
	...dateRangeFields(),
})

export type ListQrTokensFilterInput = z.input<typeof listQrTokensFilterSchema>
export type ListQrTokensFilterData = z.output<typeof listQrTokensFilterSchema>
