export type UserStatus = 'active' | 'inactive'

export interface User {
	id: string
	name: string
	email: string
	phone: string
	avatar: string | null
	status: UserStatus
	createdAt: string
	qrCodesCount: number
	postsCount: number
}
