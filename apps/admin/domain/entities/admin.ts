export type AdminRole = 'super_admin' | 'admin' | 'moderator'
export type AdminStatus = 'active' | 'inactive'

export interface Admin {
	id: number
	name: string
	email: string
	phone: string
	role: AdminRole
	status: AdminStatus
	createdAt: string
	lastLogin: string | null
}

export interface AdminUser {
	email: string
	name: string
	role: string
}
