import { z } from 'zod'
import { EVENT_STATUSES } from './events.const'

export const eventStatusSchema = z.enum(EVENT_STATUSES, {
	error: 'Statut invalide',
})

export type EventStatus = z.output<typeof eventStatusSchema>
