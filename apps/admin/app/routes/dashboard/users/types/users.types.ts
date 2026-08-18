export type UserStatus = 'active' | 'inactive'

export interface User {
	id: string
	name: string
	email: string
	phone: string | null
	avatar: string | null
	status: UserStatus
	createdAt: string
}
