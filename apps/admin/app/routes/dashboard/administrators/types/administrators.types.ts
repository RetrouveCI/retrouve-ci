export type AdminRole = 'super_admin' | 'admin' | 'moderator'
export type AdminStatus = 'active' | 'inactive'

export interface Admin {
	id: string
	name: string
	email: string
	phone: string | null
	role: AdminRole
	status: AdminStatus
	createdAt: string
	lastLogin: string | null
}
