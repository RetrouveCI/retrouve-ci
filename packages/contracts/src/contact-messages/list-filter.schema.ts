import { z } from 'zod'
import { paginationQuerySchema } from '../shared/pagination'
import { contactMessageStatusSchema } from './update-status.schema'

export const listContactMessagesFilterSchema = paginationQuerySchema.extend({
	status: contactMessageStatusSchema.optional(),
})

export type ListContactMessagesFilterInput = z.input<
	typeof listContactMessagesFilterSchema
>
export type ListContactMessagesFilterData = z.output<
	typeof listContactMessagesFilterSchema
>
