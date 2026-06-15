import type { ContactMessageStatus } from '../types/contact-message.types'

export interface ContactMessage {
	id: string
	name: string
	email: string
	subject: string
	message: string
	status: ContactMessageStatus
	createdAt: Date
	readAt: Date | null
}

export interface ContactMessageListResponse {
	items: ContactMessage[]
	total: number
	page: number
	pageSize: number
}
