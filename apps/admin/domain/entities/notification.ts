export type NotificationType = 'order' | 'user' | 'post' | 'qr' | 'system'

export interface Notification {
	id: number
	type: NotificationType
	title: string
	message: string
	read: boolean
	createdAt: string
	link: string | null
	meta?: {
		userId?: number
		orderId?: string
		postId?: number
		token?: string
	}
}
