import { z } from 'zod'
import { batchIdsSchema } from '../shared/batch'

/**
 * Archiving only. Nothing leaves the desk when a message is archived — no
 * notification, nothing the sender sees — which is what makes it the one status
 * a batch may set. Marking read happens by opening the message.
 */
export const batchUpdateContactMessageStatusSchema = z.object({
	ids: batchIdsSchema,
	status: z.literal('archived', {
		error: 'Seul l’archivage se fait en lot',
	}),
})

export type BatchUpdateContactMessageStatusInput = z.input<
	typeof batchUpdateContactMessageStatusSchema
>
export type BatchUpdateContactMessageStatusData = z.output<
	typeof batchUpdateContactMessageStatusSchema
>
