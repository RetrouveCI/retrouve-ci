import { z } from 'zod'
import { paginationQuerySchema } from '../shared/pagination'

// Same reason as `countable` in `shared/pagination`: `z.coerce` has an `unknown`
// input in Zod 4. The union needs its own message, or it answers in English.
export const notificationReadSchema = z.union(
	[z.boolean(), z.enum(['true', 'false']).transform(value => value === 'true')],
	{ error: 'Doit valoir true ou false' },
)

export const listNotificationsFilterSchema = paginationQuerySchema.extend({
	read: notificationReadSchema.optional(),
})

export type ListNotificationsFilterInput = z.input<
	typeof listNotificationsFilterSchema
>
export type ListNotificationsFilterData = z.output<
	typeof listNotificationsFilterSchema
>
