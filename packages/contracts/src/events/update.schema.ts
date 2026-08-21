import { z } from 'zod'
import { createEventSchema } from './create.schema'
import { eventStatusSchema } from './status.schema'

export const updateEventSchema = createEventSchema.partial().extend({
	status: eventStatusSchema.optional(),
})

export type UpdateEventInput = z.input<typeof updateEventSchema>
export type UpdateEventData = z.output<typeof updateEventSchema>
