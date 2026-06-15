import type { ContactMessageStatus } from './types/contact-message.types'

export const CONTACT_MESSAGE_STATUSES: ContactMessageStatus[] = [
	'new',
	'read',
	'archived',
]

export const CONTACT_MESSAGE_UPDATABLE_STATUSES: ContactMessageStatus[] = [
	'read',
	'archived',
]

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50
