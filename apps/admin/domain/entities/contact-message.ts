export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
	id: string
	name: string
	email: string
	subject: string
	message: string
	status: ContactMessageStatus
	createdAt: string
	readAt: string | null
}

export interface ContactMessageListResponse {
	items: ContactMessage[]
	total: number
	page: number
	pageSize: number
}
