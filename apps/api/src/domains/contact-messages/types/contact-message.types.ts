export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface CreateContactMessageData {
	name: string
	email?: string
	phone?: string
	subject: string
	message: string
	qrTokenCode?: string
	recipientUserId?: string
}

export interface ListContactMessagesFilter {
	status?: ContactMessageStatus
	page: number
	pageSize: number
}
