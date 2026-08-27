import { z } from 'zod'
import {
	CONTACT_MESSAGE_STATUSES,
	CONTACT_MESSAGE_UPDATABLE_STATUSES,
} from './contact-messages.const'

export const contactMessageStatusSchema = z.enum(CONTACT_MESSAGE_STATUSES, {
	error: 'Statut invalide',
})

export const updateContactMessageStatusSchema = z.object({
	status: z.enum(CONTACT_MESSAGE_UPDATABLE_STATUSES, {
		error: 'Statut invalide',
	}),
})

export type ContactMessageStatus = z.output<typeof contactMessageStatusSchema>
export type UpdateContactMessageStatusInput = z.input<
	typeof updateContactMessageStatusSchema
>
export type UpdateContactMessageStatusData = z.output<
	typeof updateContactMessageStatusSchema
>
