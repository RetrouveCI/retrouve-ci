import { z } from 'zod'

export const notificationActionSchema = z.discriminatedUnion('intent', [
	z.object({ intent: z.literal('mark-read'), id: z.string() }),
	z.object({ intent: z.literal('mark-all-read') }),
])
