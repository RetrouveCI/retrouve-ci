import { z } from 'zod'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import { qrTokenStatusSchema } from './status.schema'

export const listQrTokensFilterSchema = paginationQuerySchema.extend({
	search: listSearchSchema.optional(),
	status: qrTokenStatusSchema.optional(),
})

export type ListQrTokensFilterInput = z.input<typeof listQrTokensFilterSchema>
export type ListQrTokensFilterData = z.output<typeof listQrTokensFilterSchema>
