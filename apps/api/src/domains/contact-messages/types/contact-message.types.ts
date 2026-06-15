export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface CreateContactMessageData {
	name: string
	email: string
	subject: string
	message: string
}

export interface ListContactMessagesFilter {
	status?: ContactMessageStatus
	page: number
	pageSize: number
}
