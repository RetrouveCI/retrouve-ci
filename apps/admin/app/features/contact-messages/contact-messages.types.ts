export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
	id: string
	name: string
	email: string | null
	phone: string | null
	subject: string
	message: string
	status: ContactMessageStatus
	qrTokenCode: string | null
	recipientUserId: string | null
	createdAt: string
	readAt: string | null
}

export interface ContactMessageListResponse {
	items: ContactMessage[]
	total: number
	page: number
	pageSize: number
}
