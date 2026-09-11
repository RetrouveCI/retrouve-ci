import { z } from 'zod'
import { listSearchSchema, paginationQuerySchema } from '../shared/pagination'
import { contactMessageStatusSchema } from './update-status.schema'

export const listContactMessagesFilterSchema = paginationQuerySchema.extend({
	search: listSearchSchema.optional(),
	status: contactMessageStatusSchema.optional(),
})

export type ListContactMessagesFilterInput = z.input<
	typeof listContactMessagesFilterSchema
>
export type ListContactMessagesFilterData = z.output<
	typeof listContactMessagesFilterSchema
>
