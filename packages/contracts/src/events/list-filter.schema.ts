import { z } from 'zod'
import { paginationQuerySchema } from '../shared/pagination'
import { eventStatusSchema } from './status.schema'

export const listEventsFilterSchema = paginationQuerySchema

export const adminListEventsFilterSchema = paginationQuerySchema.extend({
	status: eventStatusSchema.optional(),
})

export type ListEventsFilterInput = z.input<typeof listEventsFilterSchema>
export type ListEventsFilterData = z.output<typeof listEventsFilterSchema>
export type AdminListEventsFilterInput = z.input<
	typeof adminListEventsFilterSchema
>
export type AdminListEventsFilterData = z.output<
	typeof adminListEventsFilterSchema
>
